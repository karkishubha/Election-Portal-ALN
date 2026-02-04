/**
 * ECN Press Release Scraper Service
 * Fetches press releases from Election Commission of Nepal website
 * https://election.gov.np/np/press-release
 */

const cheerio = require('cheerio');
const { OfficialAnnouncement } = require('../models');

const ECN_PRESS_RELEASE_URL = 'https://election.gov.np/np/press-release';

/**
 * Convert Nepali date string (२०८२/१०/२१) to ISO date
 */
function nepaliDateToISO(nepaliDate) {
  const nepaliDigits = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
  
  // Convert Nepali digits to English
  let englishDate = nepaliDate;
  for (const [nep, eng] of Object.entries(nepaliDigits)) {
    englishDate = englishDate.replace(new RegExp(nep, 'g'), eng);
  }
  
  // Parse the BS date (e.g., "2082/10/21")
  const parts = englishDate.split('/');
  if (parts.length !== 3) return new Date().toISOString().split('T')[0];
  
  const [year, month, day] = parts.map(Number);
  
  // Simple BS to AD conversion (approximate for 2082 BS = 2026 AD)
  // This is a rough conversion - for production, use a proper library
  const adYear = year - 56 - (month < 9 ? 1 : 0);
  const adMonth = ((month + 3) % 12) + 1;
  const adDay = Math.min(day, 28); // Safe day value
  
  return `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`;
}

/**
 * Fetch and parse press releases from ECN website
 */
async function fetchECNPressReleases() {
  try {
    console.log('🔄 Fetching ECN press releases...');
    
    const response = await fetch(ECN_PRESS_RELEASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const pressReleases = [];
    
    // Parse the press release items - they appear as links with dates below
    // Looking at the structure: title link followed by date
    $('a[href*="Press"]').each((index, element) => {
      const $el = $(element);
      const title = $el.text().trim();
      const link = $el.attr('href');
      
      // Skip if no title or link
      if (!title || !link) return;
      
      // Get the date from the next text node or sibling
      const parentText = $el.parent().text();
      const dateMatch = parentText.match(/[०-९]{4}\/[०-९]{1,2}\/[०-९]{1,2}/);
      
      let date = new Date().toISOString().split('T')[0];
      if (dateMatch) {
        date = nepaliDateToISO(dateMatch[0]);
      }
      
      // Ensure link is absolute
      const fullLink = link.startsWith('http') ? link : `https://election.gov.np${link}`;
      
      pressReleases.push({
        title: title.substring(0, 250), // Limit title length
        date,
        link: fullLink,
        source: 'निर्वाचन आयोग नेपाल',
      });
    });
    
    // Also try alternative parsing for the page structure
    if (pressReleases.length === 0) {
      // Try parsing based on card/list structure
      $('.card, .press-item, .news-item, [class*="press"], [class*="release"]').each((index, element) => {
        const $el = $(element);
        const $link = $el.find('a').first();
        const title = $link.text().trim() || $el.find('h3, h4, h5, .title').text().trim();
        const link = $link.attr('href');
        const dateText = $el.find('.date, time, [class*="date"]').text().trim();
        
        if (title && link) {
          const dateMatch = dateText.match(/[०-९]{4}\/[०-९]{1,2}\/[०-९]{1,2}/);
          const date = dateMatch ? nepaliDateToISO(dateMatch[0]) : new Date().toISOString().split('T')[0];
          const fullLink = link.startsWith('http') ? link : `https://election.gov.np${link}`;
          
          pressReleases.push({
            title: title.substring(0, 250),
            date,
            link: fullLink,
            source: 'निर्वाचन आयोग नेपाल',
          });
        }
      });
    }
    
    console.log(`✅ Found ${pressReleases.length} press releases from ECN`);
    return pressReleases;
    
  } catch (error) {
    console.error('❌ Error fetching ECN press releases:', error.message);
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
