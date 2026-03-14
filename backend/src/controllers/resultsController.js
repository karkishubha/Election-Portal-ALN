/**
 * Results Controller
 * Serves election results data from local JSON files
 * Data source: Election Commission of Nepal (result.election.gov.np)
 */

const path = require('path');
const fs = require('fs');

// Load data files
const PR_RESULTS_FILE = path.join(__dirname, '../data/pr-results-hor.json');
const CANDIDATES_FILE = path.join(__dirname, '../data/candidates.json');
const STATES_FILE = path.join(__dirname, '../data/states.json');
const DISTRICTS_FILE = path.join(__dirname, '../data/districts.json');
const CONSTITUENCIES_LOOKUP_FILE = path.join(__dirname, '../data/constituencies.json');

// PR seat allocation constants
const TOTAL_PR_SEATS = 110; // House of Representatives PR seats
const PR_THRESHOLD_PERCENT = 3; // 3% threshold for PR eligibility

let prResultsCache = null;
let fptpResultsCache = null;
let allCandidatesCache = null;
let statesLookupCache = null;
let districtsLookupCache = null;
let constituenciesLookupCache = null;

/**
 * Load PR results from local JSON file (cached)
 */
const loadPRResults = () => {
  if (prResultsCache) return prResultsCache;
  
  try {
    const data = fs.readFileSync(PR_RESULTS_FILE, 'utf8');
    prResultsCache = JSON.parse(data);
    console.log(`✅ Loaded ${prResultsCache.length} PR party results`);
    return prResultsCache;
  } catch (error) {
    console.error('❌ Error loading PR results file:', error.message);
    return [];
  }
};

/**
 * Load all candidates from candidates data (cached)
 */
const loadAllCandidates = () => {
  if (allCandidatesCache) return allCandidatesCache;
  
  try {
    const data = fs.readFileSync(CANDIDATES_FILE, 'utf8');
    allCandidatesCache = JSON.parse(data);
    console.log(`✅ Loaded ${allCandidatesCache.length} total candidates`);
    return allCandidatesCache;
  } catch (error) {
    console.error('❌ Error loading candidates file:', error.message);
    return [];
  }
};

/**
 * Load states lookup (cached)
 */
const loadStatesLookup = () => {
  if (statesLookupCache) return statesLookupCache;

  try {
    const data = fs.readFileSync(STATES_FILE, 'utf8');
    statesLookupCache = JSON.parse(data);
    return statesLookupCache;
  } catch (error) {
    console.error('❌ Error loading states lookup file:', error.message);
    return [];
  }
};

/**
 * Load districts lookup (cached)
 */
const loadDistrictsLookup = () => {
  if (districtsLookupCache) return districtsLookupCache;

  try {
    const data = fs.readFileSync(DISTRICTS_FILE, 'utf8');
    districtsLookupCache = JSON.parse(data);
    return districtsLookupCache;
  } catch (error) {
    console.error('❌ Error loading districts lookup file:', error.message);
    return [];
  }
};

/**
 * Load constituencies lookup (cached)
 */
const loadConstituenciesLookup = () => {
  if (constituenciesLookupCache) return constituenciesLookupCache;

  try {
    const data = fs.readFileSync(CONSTITUENCIES_LOOKUP_FILE, 'utf8');
    constituenciesLookupCache = JSON.parse(data);
    return constituenciesLookupCache;
  } catch (error) {
    console.error('❌ Error loading constituencies lookup file:', error.message);
    return [];
  }
};

/**
 * Load FPTP results from candidates data (cached)
 */
const loadFPTPResults = () => {
  if (fptpResultsCache) return fptpResultsCache;
  
  const candidates = loadAllCandidates();
  // Filter only elected candidates
  const elected = candidates.filter(c => c.Remarks === 'Elected');
  fptpResultsCache = elected;
  console.log(`✅ Loaded ${fptpResultsCache.length} FPTP winners`);
  return fptpResultsCache;
};

/**
 * Calculate PR seat allocation based on 3% threshold rule
 * Only parties with ≥3% of total votes qualify
 * Seats allocated proportionally among qualifying parties
 * using largest remainder (Hamilton) apportionment.
 */
const calculatePRSeats = (prResults) => {
  const totalVotes = prResults.reduce((sum, p) => sum + (p.TotalVoteReceived || 0), 0);
  const thresholdVotes = (totalVotes * PR_THRESHOLD_PERCENT) / 100;
  
  // Filter parties that meet the threshold
  const qualifyingParties = prResults.filter(p => 
    (p.TotalVoteReceived || 0) >= thresholdVotes
  );
  
  // Calculate total votes among qualifying parties only
  const qualifyingVotes = qualifyingParties.reduce(
    (sum, p) => sum + (p.TotalVoteReceived || 0), 0
  );

  // Allocate PR seats with largest remainder (Hamilton) method:
  // 1) quota = vote share * total seats
  // 2) assign floor(quota)
  // 3) distribute remaining seats by largest fractional remainders
  const qualifyingWithAllocation = qualifyingParties.map((party) => {
    const votes = party.TotalVoteReceived || 0;
    const exactQuota = qualifyingVotes > 0
      ? (votes / qualifyingVotes) * TOTAL_PR_SEATS
      : 0;

    return {
      symbolId: party.SymbolID,
      votes,
      exactQuota,
      baseSeats: Math.floor(exactQuota),
      remainder: exactQuota - Math.floor(exactQuota)
    };
  });

  const baseSeatsTotal = qualifyingWithAllocation.reduce(
    (sum, p) => sum + p.baseSeats,
    0
  );

  let remainingSeats = Math.max(0, TOTAL_PR_SEATS - baseSeatsTotal);

  const byRemainder = [...qualifyingWithAllocation]
    .sort((a, b) => {
      if (b.remainder !== a.remainder) return b.remainder - a.remainder;
      return b.votes - a.votes;
    });

  const extraSeatsBySymbol = new Map();
  for (const party of byRemainder) {
    extraSeatsBySymbol.set(party.symbolId, 0);
  }

  let i = 0;
  while (remainingSeats > 0 && byRemainder.length > 0) {
    const party = byRemainder[i % byRemainder.length];
    extraSeatsBySymbol.set(
      party.symbolId,
      (extraSeatsBySymbol.get(party.symbolId) || 0) + 1
    );
    remainingSeats -= 1;
    i += 1;
  }

  const seatsBySymbol = new Map(
    qualifyingWithAllocation.map((party) => {
      const totalSeats = party.baseSeats + (extraSeatsBySymbol.get(party.symbolId) || 0);
      return [party.symbolId, totalSeats];
    })
  );
  
  // Calculate seats for each qualifying party
  const partiesWithSeats = prResults.map(party => {
    const votes = party.TotalVoteReceived || 0;
    const percentage = (votes / totalVotes) * 100;
    const meetsThreshold = votes >= thresholdVotes;
    
    // Get allocated seats (only for qualifying parties)
    let projectedSeats = 0;
    let seatPercentage = 0;
    
    if (meetsThreshold && qualifyingVotes > 0) {
      seatPercentage = (votes / qualifyingVotes) * 100;
      projectedSeats = seatsBySymbol.get(party.SymbolID) || 0;
    }
    
    return {
      partyName: party.PoliticalPartyName,
      symbolId: party.SymbolID,
      votes,
      percentage: percentage.toFixed(2),
      meetsThreshold,
      seatPercentage: seatPercentage.toFixed(2),
      projectedSeats
    };
  });
  
  return {
    totalVotes,
    thresholdVotes,
    thresholdPercent: PR_THRESHOLD_PERCENT,
    qualifyingParties: qualifyingParties.length,
    qualifyingVotes,
    totalPRSeats: TOTAL_PR_SEATS,
    parties: partiesWithSeats
  };
};

/**
 * Get PR (Proportional Representation) results with seat allocation
 * GET /api/results/pr
 */
const getPRResults = async (req, res) => {
  try {
    const results = loadPRResults();
    
    if (results.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'PR results data not available'
      });
    }
    
    // Calculate seats with threshold
    const seatAllocation = calculatePRSeats(results);
    
    res.status(200).json({
      success: true,
      message: 'PR results retrieved successfully',
      count: results.length,
      ...seatAllocation,
      source: 'Election Commission of Nepal',
      lastUpdated: '2026-03-10'
    });
  } catch (error) {
    console.error('❌ PR Results Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching PR results',
      error: error.message
    });
  }
};

/**
 * Get FPTP (First Past The Post) results - elected candidates
 * GET /api/results/fptp
 */
const getFPTPResults = async (req, res) => {
  try {
    const elected = loadFPTPResults();
    
    if (elected.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'FPTP results data not available'
      });
    }
    
    // Group by party for summary
    const partySeats = {};
    elected.forEach(c => {
      const party = c.PoliticalPartyName || 'Independent';
      partySeats[party] = (partySeats[party] || 0) + 1;
    });
    
    // Sort parties by seats
    const partySummary = Object.entries(partySeats)
      .map(([party, seats]) => ({ party, seats }))
      .sort((a, b) => b.seats - a.seats);
    
    res.status(200).json({
      success: true,
      message: 'FPTP results retrieved successfully',
      totalSeats: elected.length,
      partySummary,
      data: elected,
      source: 'Election Commission of Nepal',
      lastUpdated: '2026-03-10'
    });
  } catch (error) {
    console.error('❌ FPTP Results Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FPTP results',
      error: error.message
    });
  }
};

/**
 * Get combined results summary
 * GET /api/results/summary
 */
const getResultsSummary = async (req, res) => {
  try {
    const prResults = loadPRResults();
    const fptpResults = loadFPTPResults();
    
    // FPTP party seats
    const fptpSeats = {};
    fptpResults.forEach(c => {
      const party = c.PoliticalPartyName || 'Independent';
      fptpSeats[party] = (fptpSeats[party] || 0) + 1;
    });
    
    // PR total votes
    const prTotalVotes = prResults.reduce((sum, p) => sum + (p.TotalVoteReceived || 0), 0);
    
    // Top 5 PR parties
    const topPRParties = prResults.slice(0, 5).map(p => ({
      party: p.PoliticalPartyName,
      votes: p.TotalVoteReceived,
      percentage: ((p.TotalVoteReceived / prTotalVotes) * 100).toFixed(2)
    }));
    
    // Top FPTP parties
    const topFPTPParties = Object.entries(fptpSeats)
      .map(([party, seats]) => ({ party, seats }))
      .sort((a, b) => b.seats - a.seats)
      .slice(0, 5);
    
    res.status(200).json({
      success: true,
      message: 'Results summary retrieved successfully',
      fptp: {
        totalSeats: fptpResults.length,
        topParties: topFPTPParties
      },
      pr: {
        totalVotes: prTotalVotes,
        topParties: topPRParties
      },
      source: 'Election Commission of Nepal',
      lastUpdated: '2026-03-10'
    });
  } catch (error) {
    console.error('❌ Results Summary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching results summary',
      error: error.message
    });
  }
};

/**
 * Get random constituency winners for slider
 * GET /api/results/slider
 */
const getSliderData = async (req, res) => {
  try {
    const elected = loadFPTPResults();
    
    if (elected.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No elected candidates data available'
      });
    }
    
    // Get unique constituencies
    const constituencies = [...new Set(elected.map(c => c.SCConstID))];
    
    // Pick 10 random constituencies
    const shuffled = constituencies.sort(() => 0.5 - Math.random());
    const selectedConstituencies = shuffled.slice(0, 10);
    
    // Get winner and top 3 for each selected constituency
    const sliderData = selectedConstituencies.map(constId => {
      // Get all candidates for this constituency (from full data not just elected)
      const constCandidates = loadCandidatesForConstituency(constId);
      const sorted = constCandidates.sort((a, b) => (b.TotalVoteReceived || 0) - (a.TotalVoteReceived || 0));
      const top3 = sorted.slice(0, 3);
      
      return {
        constituencyId: constId,
        districtName: top3[0]?.DistrictName || 'Unknown',
        stateName: top3[0]?.StateName || 'Unknown',
        candidates: top3.map(c => ({
          name: c.CandidateName,
          party: c.PoliticalPartyName,
          votes: c.TotalVoteReceived,
          rank: c.Rank,
          isWinner: c.Remarks === 'Elected'
        }))
      };
    });
    
    res.status(200).json({
      success: true,
      data: sliderData
    });
  } catch (error) {
    console.error('❌ Slider Data Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Helper to get all candidates for a constituency
 */
const loadCandidatesForConstituency = (constId) => {
  const candidates = loadAllCandidates();
  return candidates.filter(c => String(c.SCConstID) === String(constId));
};

/**
 * Get FPTP results grouped by state/province for map visualization
 * GET /api/results/map
 */
const getMapData = async (req, res) => {
  try {
    const { groupBy = 'state' } = req.query; // state, district, or constituency
    const elected = loadFPTPResults();
    const allCandidates = loadAllCandidates();
    
    if (elected.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No elected candidates data available'
      });
    }
    
    let mapData;
    
    if (groupBy === 'state') {
      // Group by state/province
      const stateMap = {};
      
      // Get unique states from all candidates for complete data
      const states = [...new Set(allCandidates.map(c => c.StateName).filter(Boolean))];
      
      states.forEach(state => {
        const stateElected = elected.filter(c => c.StateName === state);
        const partySeats = {};
        
        stateElected.forEach(c => {
          const party = c.PoliticalPartyName || 'Independent';
          partySeats[party] = (partySeats[party] || 0) + 1;
        });
        
        // Find winning party (most seats)
        const partiesArray = Object.entries(partySeats)
          .map(([party, seats]) => ({ party, seats }))
          .sort((a, b) => b.seats - a.seats);
        
        stateMap[state] = {
          name: state,
          totalSeats: stateElected.length,
          winningParty: partiesArray[0]?.party || null,
          parties: partiesArray
        };
      });
      
      mapData = Object.values(stateMap);
    } 
    else if (groupBy === 'district') {
      // Group by district
      const districtMap = {};
      const districts = [...new Set(allCandidates.map(c => c.DistrictName).filter(Boolean))];
      
      districts.forEach(district => {
        const districtElected = elected.filter(c => c.DistrictName === district);
        const districtCandidate = allCandidates.find(c => c.DistrictName === district);
        const partySeats = {};
        
        districtElected.forEach(c => {
          const party = c.PoliticalPartyName || 'Independent';
          partySeats[party] = (partySeats[party] || 0) + 1;
        });
        
        const partiesArray = Object.entries(partySeats)
          .map(([party, seats]) => ({ party, seats }))
          .sort((a, b) => b.seats - a.seats);
        
        districtMap[district] = {
          name: district,
          state: districtCandidate?.StateName || 'Unknown',
          totalSeats: districtElected.length,
          winningParty: partiesArray[0]?.party || null,
          parties: partiesArray
        };
      });
      
      mapData = Object.values(districtMap);
    }
    else {
      // Group by constituency (default detailed view)
      const constituencyMap = {};
      const constituencies = [...new Set(allCandidates.map(c => c.SCConstID).filter(Boolean))];
      
      constituencies.forEach(constId => {
        const constCandidates = allCandidates.filter(c => String(c.SCConstID) === String(constId));
        const winner = constCandidates.find(c => c.Remarks === 'Elected');
        const sorted = constCandidates.sort((a, b) => (b.TotalVoteReceived || 0) - (a.TotalVoteReceived || 0));
        
        constituencyMap[constId] = {
          id: constId,
          district: constCandidates[0]?.DistrictName || 'Unknown',
          state: constCandidates[0]?.StateName || 'Unknown',
          winner: winner ? {
            name: winner.CandidateName,
            party: winner.PoliticalPartyName,
            votes: winner.TotalVoteReceived
          } : null,
          totalCandidates: constCandidates.length,
          topCandidates: sorted.slice(0, 3).map(c => ({
            name: c.CandidateName,
            party: c.PoliticalPartyName,
            votes: c.TotalVoteReceived,
            isWinner: c.Remarks === 'Elected'
          }))
        };
      });
      
      mapData = Object.values(constituencyMap);
    }
    
    res.status(200).json({
      success: true,
      groupBy,
      count: mapData.length,
      data: mapData,
      source: 'Election Commission of Nepal',
      lastUpdated: '2026-03-10'
    });
  } catch (error) {
    console.error('❌ Map Data Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching map data',
      error: error.message
    });
  }
};

/**
 * Get FPTP results filtered by state/district
 * GET /api/results/fptp/filter
 */
const getFilteredFPTPResults = async (req, res) => {
  try {
    const { state, district, districtId, constituency } = req.query;
    const norm = (v) => String(v ?? '').trim();
    let candidates = loadAllCandidates();
    
    // Apply filters
    if (state) {
      candidates = candidates.filter(c => norm(c.StateName) === norm(state));
    }

    // Prefer districtId from lookup to avoid Unicode/name mismatch issues.
    if (districtId) {
      const dId = Number(districtId);
      candidates = candidates.filter(c => Number(c.DistrictCd) === dId);
    } else if (district) {
      candidates = candidates.filter(c => norm(c.DistrictName) === norm(district));
    }

    if (constituency) {
      candidates = candidates.filter(c => norm(c.SCConstID) === norm(constituency));
    }
    
    // Sort by votes
    candidates = candidates.sort((a, b) => (b.TotalVoteReceived || 0) - (a.TotalVoteReceived || 0));
    
    // Get winners
    const winners = candidates.filter(c => c.Remarks === 'Elected');
    
    // Party summary for filtered results
    const partySeats = {};
    winners.forEach(c => {
      const party = c.PoliticalPartyName || 'Independent';
      partySeats[party] = (partySeats[party] || 0) + 1;
    });
    
    const partySummary = Object.entries(partySeats)
      .map(([party, seats]) => ({ party, seats }))
      .sort((a, b) => b.seats - a.seats);
    
    res.status(200).json({
      success: true,
      filters: { state, district, districtId, constituency },
      totalCandidates: candidates.length,
      totalWinners: winners.length,
      partySummary,
      candidates: candidates.slice(0, 100), // Limit response size
      source: 'Election Commission of Nepal',
      lastUpdated: '2026-03-10'
    });
  } catch (error) {
    console.error('❌ Filtered FPTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Get list of states/provinces
 * GET /api/results/states
 */
const getStates = async (req, res) => {
  try {
    const states = loadStatesLookup()
      .map(s => s.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    
    res.status(200).json({
      success: true,
      count: states.length,
      data: states.sort()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get list of districts (optionally filtered by state)
 * GET /api/results/districts
 */
const getDistricts = async (req, res) => {
  try {
    const { state } = req.query;
    const statesLookup = loadStatesLookup();
    const stateIdToName = Object.fromEntries(statesLookup.map(s => [String(s.id), s.name]));
    const stateNameToId = Object.fromEntries(statesLookup.map(s => [s.name, String(s.id)]));

    const districts = loadDistrictsLookup()
      .filter(d => d.parentId && d.name && d.name !== 'NA')
      .filter(d => !state || String(d.parentId) === stateNameToId[state])
      .map(d => ({
        name: d.name,
        state: stateIdToName[String(d.parentId)] || 'Unknown'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    res.status(200).json({
      success: true,
      count: districts.length,
      data: districts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get list of constituencies (optionally filtered by state/district)
 * GET /api/results/constituencies
 */
const getConstituencies = async (req, res) => {
  try {
    const { state, district } = req.query;
    const statesLookup = loadStatesLookup();
    const districtsLookup = loadDistrictsLookup().filter(d => d.parentId && d.name && d.name !== 'NA');
    const constituenciesLookup = loadConstituenciesLookup();
    const elected = loadFPTPResults();

    const stateIdToName = Object.fromEntries(statesLookup.map(s => [String(s.id), s.name]));
    const stateNameToId = Object.fromEntries(statesLookup.map(s => [s.name, String(s.id)]));
    const districtIdToMeta = Object.fromEntries(
      districtsLookup.map(d => [String(d.id), { name: d.name, stateId: String(d.parentId) }])
    );
    const constituencyCountByDistrict = constituenciesLookup.reduce((acc, c) => {
      const distId = String(c.distId);
      const count = Number(c.consts || 0);
      acc[distId] = Math.max(acc[distId] || 0, count);
      return acc;
    }, {});

    const winnersByKey = {};
    elected.forEach(w => {
      const key = `${w.StateName}||${w.DistrictName}||${String(w.SCConstID)}`;
      winnersByKey[key] = {
        winner: w.CandidateName || null,
        winnerParty: w.PoliticalPartyName || null,
      };
    });

    const targetStateId = state ? stateNameToId[state] : null;
    const targetDistrict = district || null;

    const constituencies = [];

    Object.entries(districtIdToMeta).forEach(([districtId, meta]) => {
      if (targetStateId && meta.stateId !== targetStateId) return;
      if (targetDistrict && meta.name !== targetDistrict) return;

      const count = constituencyCountByDistrict[districtId] || 0;
      if (count <= 0) return;

      const stateName = stateIdToName[meta.stateId] || 'Unknown';

      for (let i = 1; i <= count; i++) {
        const winKey = `${stateName}||${meta.name}||${String(i)}`;
        const winnerMeta = winnersByKey[winKey] || { winner: null, winnerParty: null };
        constituencies.push({
          id: String(i),
          districtId: Number(districtId),
          stateId: Number(meta.stateId),
          district: meta.name,
          state: stateName,
          winner: winnerMeta.winner,
          winnerParty: winnerMeta.winnerParty,
        });
      }
    });

    constituencies.sort((a, b) => {
      const stateCmp = a.state.localeCompare(b.state);
      if (stateCmp !== 0) return stateCmp;
      const distCmp = a.district.localeCompare(b.district);
      if (distCmp !== 0) return distCmp;
      return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
    });
    
    res.status(200).json({
      success: true,
      count: constituencies.length,
      data: constituencies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getPRResults,
  getFPTPResults,
  getResultsSummary,
  getSliderData,
  getMapData,
  getFilteredFPTPResults,
  getStates,
  getDistricts,
  getConstituencies
};
