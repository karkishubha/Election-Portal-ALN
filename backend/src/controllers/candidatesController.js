/**
 * Candidates Controller
 * Proxy for Election Commission Candidates API
 */

const https = require('https');

const CANDIDATES_API_URL = 'https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt';

/**
 * Fetch and proxy candidates data from Election Commission
 * GET /api/candidates
 */
const getCandidates = async (req, res) => {
  try {
    // Fetch data from Election Commission API
    https.get(CANDIDATES_API_URL, (apiResponse) => {
      let data = '';

      // Collect data chunks
      apiResponse.on('data', (chunk) => {
        data += chunk;
      });

      // When complete, send to client
      apiResponse.on('end', () => {
        try {
          const candidates = JSON.parse(data);
          
          res.status(200).json({
            success: true,
            message: 'Candidates data retrieved successfully',
            count: candidates.length,
            data: candidates,
            source: 'Election Commission of Nepal',
            lastFetched: new Date().toISOString()
          });
        } catch (parseError) {
          console.error('Error parsing candidates data:', parseError);
          res.status(500).json({
            success: false,
            message: 'Failed to parse candidates data',
            error: parseError.message
          });
        }
      });

    }).on('error', (error) => {
      console.error('Error fetching candidates data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch candidates data from Election Commission',
        error: error.message
      });
    });

  } catch (error) {
    console.error('Candidates Controller Error:', error);
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
