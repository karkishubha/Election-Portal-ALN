/**
 * ECN Press Release Scraper Service
 * Fetches press releases from Election Commission of Nepal website
 * https://election.gov.np/np/press-release
 * 
 * Uses Puppeteer because the ECN website is a React SPA
 */

const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const { OfficialAnnouncement } = require('../models');

const ECN_PRESS_RELEASE_URL = 'https://election.gov.np/np/press-release';

/**
 * Convert Nepali date string (२०८२/१०/२१ or 2082/10/21) to ISO date
 */
function nepaliDateToISO(nepaliDate) {
  const nepaliDigits = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
  
  // Convert Nepali digits to English
  let englishDate = nepaliDate;
  for (const [nep, eng] of Object.entries(nepaliDigits)) {
    englishDate = englishDate.replace(new RegExp(nep, 'g'), eng);
  }
  
  // Normalize separators to /
  englishDate = englishDate.replace(/[\-\.]/g, '/');
  
  // Parse the BS date (e.g., "2082/10/21")
  const parts = englishDate.split('/');
  if (parts.length !== 3) return new Date().toISOString().split('T')[0];
  
  const [bsYear, bsMonth, bsDay] = parts.map(Number);
  
  // BS to AD conversion for 2082 BS
  // Magh (10) 2082 = Jan 2026
  // Falgun (11) 2082 = Feb 2026
  // Chaitra (12) 2082 = Mar 2026
  // Baisakh (1) 2082 = Apr 2025
  
  let adYear, adMonth;
  if (bsMonth >= 9) {
    // Poush (9) to Chaitra (12) - same year offset
    adYear = bsYear - 56;
    adMonth = bsMonth - 8; // 9->1(Jan), 10->2(Feb), 11->3(Mar), 12->4(Apr)
  } else {
    // Baisakh (1) to Mangsir (8) - previous year offset  
    adYear = bsYear - 57;
    adMonth = bsMonth + 4; // 1->5(May), 2->6(Jun), etc.
  }
  
  const adDay = Math.min(bsDay, 28);
  
  return `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`;
}

/**
 * Get browser instance - works both locally and on Render
 */
async function getBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production (Render) - use @sparticuz/chromium
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local development - try to find Chrome
    const possiblePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
    ];
    
    let executablePath = null;
    for (const path of possiblePaths) {
      try {
        const fs = require('fs');
        if (fs.existsSync(path)) {
          executablePath = path;
          break;
        }
      } catch {}
    }
    
    return puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
}

/**
 * Fetch and parse press releases from ECN website using Puppeteer
 */
async function fetchECNPressReleases() {
  let browser = null;
  
  try {
    console.log('🔄 Fetching ECN press releases with Puppeteer...');
    
    browser = await getBrowser();
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navigate and wait for content to load
    await page.goto(ECN_PRESS_RELEASE_URL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for press release content to appear
    await page.waitForSelector('a[href*="storage"]', { timeout: 15000 }).catch(() => {
      console.log('⚠️ No storage links found, trying alternative selectors...');
    });
    
    // Extract press releases from the page
    const pressReleases = await page.evaluate(() => {
      const items = [];
      
      // Find all links to press release documents (PDF/images in storage)
      const links = document.querySelectorAll('a[href*="storage"]');
      
      links.forEach(link => {
        const title = link.textContent?.trim();
        const href = link.getAttribute('href');
        
        if (!title || !href) return;
        
        // Try to get date from various sources
        let dateText = '';
        
        // 1. Check parent and siblings for date
        let current = link;
        for (let i = 0; i < 5; i++) {
          const parent = current.parentElement;
          if (!parent) break;
          
          const text = parent.textContent || '';
          // Match dates like 2082/10/21 or २०८२/१०/२१
          const dateMatch = text.match(/[0-9०-९]{4}[\/\-\.][0-9०-९]{1,2}[\/\-\.][0-9०-९]{1,2}/);
          if (dateMatch) {
            dateText = dateMatch[0];
            break;
          }
          current = parent;
        }
        
        // 2. Try to extract date from the link URL (e.g., "2082-10-19")
        if (!dateText) {
          const urlMatch = href.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
          if (urlMatch) {
            dateText = `${urlMatch[1]}/${urlMatch[2]}/${urlMatch[3]}`;
          }
        }
        
        // 3. Try to extract from title (e.g., "२०८२.१०.२०")
        if (!dateText) {
          const titleMatch = title.match(/[०-९]{4}[\.\/\-][०-९]{1,2}[\.\/\-][०-९]{1,2}/);
          if (titleMatch) {
            dateText = titleMatch[0].replace(/\./g, '/');
          }
        }
        
        items.push({
          title: title.substring(0, 250),
          link: href.startsWith('http') ? href : `https://election.gov.np${href}`,
          dateText,
        });
      });
      
      return items;
    });
    
    await browser.close();
    browser = null;
    
    // Process and convert dates
    const processed = pressReleases.map(item => ({
      title: item.title,
      date: item.dateText ? nepaliDateToISO(item.dateText) : new Date().toISOString().split('T')[0],
      link: item.link,
      source: 'निर्वाचन आयोग नेपाल',
    }));
    
    console.log(`✅ Found ${processed.length} press releases from ECN`);
    return processed;
    
  } catch (error) {
    console.error('❌ Error fetching ECN press releases:', error.message);
    if (browser) {
      await browser.close().catch(() => {});
    }
    return [];
  }
}

/**
 * Sync ECN press releases to database
 * Only adds new announcements that don't exist
 */
async function syncECNPressReleases() {
  try {
    const pressReleases = await fetchECNPressReleases();
    
    if (pressReleases.length === 0) {
      console.log('ℹ️  No press releases found to sync');
      return { added: 0, skipped: 0 };
    }
    
    let added = 0;
    let skipped = 0;
    
    for (const release of pressReleases) {
      // Check if announcement with same link already exists
      const existing = await OfficialAnnouncement.findOne({
        where: { link: release.link }
      });
      
      if (existing) {
        skipped++;
        continue;
      }
      
      // Create new announcement
      await OfficialAnnouncement.create({
        title: release.title,
        date: release.date,
        source: release.source,
        link: release.link,
        priority: 'high', // ECN releases are high priority
        published: true,
      });
      
      added++;
    }
    
    console.log(`✅ ECN Sync complete: ${added} added, ${skipped} skipped (already exist)`);
    return { added, skipped };
    
  } catch (error) {
    console.error('❌ Error syncing ECN press releases:', error.message);
    throw error;
  }
}

module.exports = {
  fetchECNPressReleases,
  syncECNPressReleases,
  ECN_PRESS_RELEASE_URL,
};
