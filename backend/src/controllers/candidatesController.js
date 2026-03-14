/**
 * Candidates Controller
 * Serves election candidates data from local JSON file
 * Data source: Election Commission of Nepal (result.election.gov.np)
 */

const path = require('path');
const fs = require('fs');

// Load candidates data from local JSON file
const CANDIDATES_FILE = path.join(__dirname, '../data/candidates.json');
let candidatesCache = null;

/**
 * Load candidates from local JSON file (cached)
 */
const loadCandidates = () => {
  if (candidatesCache) {
    return candidatesCache;
  }
  
  try {
    const data = fs.readFileSync(CANDIDATES_FILE, 'utf8');
    candidatesCache = JSON.parse(data);
    console.log(`✅ Loaded ${candidatesCache.length} candidates from local file`);
    return candidatesCache;
  } catch (error) {
    console.error('❌ Error loading candidates file:', error.message);
    return [];
  }
};

/**
 * Get all candidates data
 * GET /api/candidates
 */
const getCandidates = async (req, res) => {
  try {
    const candidates = loadCandidates();
    
    if (candidates.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Candidates data not available',
        error: 'Data file missing or corrupted'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Candidates data retrieved successfully',
      count: candidates.length,
      data: candidates,
      source: 'Election Commission of Nepal',
      lastUpdated: '2026-03-10'
    });
  } catch (error) {
    console.error('❌ Candidates Controller Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching candidates',
      error: error.message
    });
  }
};

module.exports = {
  getCandidates
};
