const express = require('express');
const router = express.Router();
const https = require('https');

// ECN base URL
const ECN_BASE = 'https://election.gov.np/SecureJson.ashx?file=';

// Simple in-memory cache (5 minute TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Fetch JSON from ECN with caching
 */
async function fetchEcnJson(path) {
  const cacheKey = path;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const url = `${ECN_BASE}${path}`;
  
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://election.gov.np/'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`ECN returned ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          cache.set(cacheKey, { data: json, timestamp: Date.now() });
          resolve(json);
        } catch (e) {
          reject(new Error('Invalid JSON from ECN'));
        }
      });
    }).on('error', reject);
  });
}

/**
 * GET /api/geo/provinces
 * Returns all 7 provinces GeoJSON
 */
router.get('/provinces', async (req, res) => {
  try {
    const data = await fetchEcnJson('JSONFiles/JSONMap/geojson/Province.json');
    res.json(data);
  } catch (err) {
    console.error('Failed to fetch provinces:', err.message);
    res.status(502).json({ error: 'Failed to fetch province data from ECN' });
  }
});

/**
 * GET /api/geo/districts/:stateId
 * Returns districts for a specific state/province
 */
router.get('/districts/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params;
    const data = await fetchEcnJson(`JSONFiles/JSONMap/geojson/District/STATE_C_${stateId}.json`);
    res.json(data);
  } catch (err) {
    console.error(`Failed to fetch districts for state ${req.params.stateId}:`, err.message);
    res.status(502).json({ error: 'Failed to fetch district data from ECN' });
  }
});

/**
 * GET /api/geo/constituencies/:districtId
 * Returns constituencies for a specific district
 */
router.get('/constituencies/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    const data = await fetchEcnJson(`JSONFiles/JSONMap/geojson/Const/dist-${districtId}.json`);
    res.json(data);
  } catch (err) {
    console.error(`Failed to fetch constituencies for district ${req.params.districtId}:`, err.message);
    res.status(502).json({ error: 'Failed to fetch constituency data from ECN' });
  }
});

/**
 * GET /api/geo/fptp/:districtId/:constNo
 * Returns FPTP results for a specific constituency
 */
router.get('/fptp/:districtId/:constNo', async (req, res) => {
  try {
    const { districtId, constNo } = req.params;
    const data = await fetchEcnJson(`JSONFiles/Election2082/HOR/FPTP/HOR-${districtId}-${constNo}.json`);
    res.json(data);
  } catch (err) {
    console.error(`Failed to fetch FPTP for ${req.params.districtId}-${req.params.constNo}:`, err.message);
    res.status(502).json({ error: 'Failed to fetch FPTP data from ECN' });
  }
});

module.exports = router;
