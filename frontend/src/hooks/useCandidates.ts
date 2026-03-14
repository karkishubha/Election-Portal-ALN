import { useState, useEffect, useMemo } from 'react';
import { Candidate, FilterState, AggregatedStats, AGE_GROUPS } from '@/types/candidates';

// Backend API URL for candidates data
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CANDIDATES_API_URL = `${API_BASE_URL}/candidates`;

// Timeout for fetch requests (30 seconds - file is large)
const FETCH_TIMEOUT_MS = 30000;

// Cache configuration
const CACHE_KEY = 'nepal_election_candidates_2082_results';
const CACHE_EXPIRY_KEY = 'nepal_election_candidates_2082_results_expiry';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours (results are final)

// Education group mapping
const educationGroupKeywords: Record<string, string[]> = {
  "Ph.D / M.Phil": ["विद्यावारिधी", "बिद्यावारीधि", "पि.एच.डि", "PHD", "Ph.D", "M.Phil", "एम.फिल"],
  "Masters": ["स्नातकोत्तर", "M.A", "MA", "एम.ए", "M.Sc", "MSC", "MBA", "MBS", "M.Ed", "एम.एड", "मास्टर्स", "Master"],
  "Bachelors": ["स्नातक", "B.A", "BA", "बि.ए", "B.Sc", "BSC", "BBS", "BBA", "B.Ed", "बि.एड", "MBBS", "BE", "Bachelor"],
  "+2 / Diploma": ["प्रविणता", "+2", "12", "१२", "Intermediate", "I.A", "I.Com", "आई.ए", "प्रमाण पत्र"],
  "SLC / SEE": ["एस.एल.सी", "SLC", "SEE", "१०", "10 पास", "दशौ", "कक्षा 10"],
  "Below SLC": ["आठौं", "कक्षा 8", "कक्षा 5", "प्रा.वि"],
  "Literate": ["साक्षर", "पढ्न लेख्न सक्ने"]
};

// Helper to get education group
export function getEducationGroup(qualification: string): string {
  if (!qualification) return "Other";
  
  const qual = qualification.toLowerCase();
  
  for (const [group, keywords] of Object.entries(educationGroupKeywords)) {
    if (keywords.some(keyword => qual.includes(keyword.toLowerCase()))) {
      return group;
    }
  }
  
  return "Other";
}

/**
 * Get cached candidates from localStorage
 */
function getCachedCandidates(): Candidate[] | null {
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiry || Date.now() > parseInt(expiry)) {
      // Cache expired or doesn't exist
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      return null;
    }
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      console.log(`Loaded ${data.length} candidates from cache`);
      return data;
    }
  } catch (e) {
    console.warn('Failed to read cache:', e);
  }
  return null;
}

/**
 * Save candidates to localStorage cache
 */
function setCachedCandidates(candidates: Candidate[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(candidates));
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION_MS).toString());
    console.log(`Cached ${candidates.length} candidates (expires in 7 days)`);
  } catch (e) {
    console.warn('Failed to cache candidates:', e);
  }
}

/**
 * Fetch candidates data - uses cache if available, otherwise fetches from backend API
 */
export const useCandidatesData = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        
        // Check cache first - instant load!
        const cachedData = getCachedCandidates();
        if (cachedData && cachedData.length > 0) {
          console.log('✅ Loaded from cache:', cachedData.length, 'candidates');
          setCandidates(cachedData);
          setError(null);
          setIsLoading(false);
          return;
        }
        
        // Fetch from backend API
        console.log('🔄 Fetching from backend API...');
        const startTime = Date.now();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        
        const response = await fetch(CANDIDATES_API_URL, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.message || 'Failed to fetch candidates');
        }
        
        const data = result.data;
        console.log(`📊 Loaded ${data.length} candidates in ${Date.now() - startTime}ms`);
        
        // Normalize data - map new field names to expected ones
        const normalizedData = data.map((c: Candidate) => ({
          ...c,
          AGE_YR: c.Age || c.AGE_YR, // Support both old and new field names
        }));
        
        setCandidates(normalizedData);
        setCachedCandidates(normalizedData); // Save to cache
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        console.error('Error fetching candidates:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  return { candidates, isLoading, error };
};

/**
 * Filter candidates based on filter state
 */
export const useFilteredCandidates = (
  candidates: Candidate[],
  filters: FilterState
): Candidate[] => {
  return useMemo(() => {
    return candidates.filter((candidate) => {
      if (filters.province && candidate.StateName !== filters.province) return false;
      if (filters.district && candidate.DistrictName !== filters.district) return false;
      if (filters.party && candidate.PoliticalPartyName !== filters.party) return false;
      
      // Filter by grouped qualification
      if (filters.qualification && getEducationGroup(candidate.QUALIFICATION) !== filters.qualification) return false;
      
      if (filters.gender && candidate.Gender !== filters.gender) return false;
      
      // SCConstID can be string or number, so compare as strings
      if (filters.constituency && String(candidate.SCConstID) !== String(filters.constituency)) return false;
      
      const age = candidate.Age || candidate.AGE_YR || 0;
      if (filters.ageMin && age < filters.ageMin) return false;
      if (filters.ageMax && age > filters.ageMax) return false;
      
      if (filters.searchText) {
        const search = filters.searchText.toLowerCase();
        return (
          candidate.CandidateName.toLowerCase().includes(search) ||
          candidate.PoliticalPartyName.toLowerCase().includes(search) ||
          candidate.DistrictName.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [candidates, filters]);
};

/**
 * Get aggregated statistics from candidates
 */
export const useAggregatedStats = (candidates: Candidate[]): AggregatedStats => {
  return useMemo(() => {
    const stats: AggregatedStats = {
      totalCandidates: candidates.length,
      byParty: {},
      byProvince: {},
      byDistrict: {},
      byGender: {},
      byQualification: {},
      byAgeGroup: {},
    };

    // Initialize age groups
    AGE_GROUPS.forEach(group => {
      stats.byAgeGroup[group.label] = 0;
    });

    candidates.forEach((candidate) => {
      // Count by party
      stats.byParty[candidate.PoliticalPartyName] = 
        (stats.byParty[candidate.PoliticalPartyName] || 0) + 1;

      // Count by province
      stats.byProvince[candidate.StateName] = 
        (stats.byProvince[candidate.StateName] || 0) + 1;

      // Count by district
      stats.byDistrict[candidate.DistrictName] = 
        (stats.byDistrict[candidate.DistrictName] || 0) + 1;

      // Count by gender
      stats.byGender[candidate.Gender] = 
        (stats.byGender[candidate.Gender] || 0) + 1;

      // Count by qualification (grouped)
      const eduGroup = getEducationGroup(candidate.QUALIFICATION);
      stats.byQualification[eduGroup] = 
        (stats.byQualification[eduGroup] || 0) + 1;

      // Count by age group
      const age = candidate.Age || candidate.AGE_YR || 0;
      const ageGroup = AGE_GROUPS.find(
        g => age >= g.min && age <= g.max
      );
      if (ageGroup) {
        stats.byAgeGroup[ageGroup.label]++;
      }
    });

    return stats;
  }, [candidates]);
};

/**
 * Get unique filter options from candidates
 */
export const useFilterOptions = (
  candidates: Candidate[],
  filters: FilterState
) => {
  return useMemo(() => {
    // Priority parties for sorting
    const PRIORITY_PARTIES = [
      "राष्ट्रिय स्वतन्त्र पार्टी",
      "नेपाली काँग्रेस",
      "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)",
      "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)",
      "राष्ट्रिय प्रजातन्त्र पार्टी",
      "जनता समाजवादी पार्टी, नेपाल",
      "जनमत पार्टी",
      "स्वतन्त्र"
    ];

    const provinces = Array.from(new Set(candidates.map(c => c.StateName))).filter(Boolean).sort();
    
    const districts = Array.from(
      new Set(
        candidates
          .filter(c => !filters.province || c.StateName === filters.province)
          .map(c => c.DistrictName)
      )
    ).filter(Boolean).sort();
    
    const parties = Array.from(new Set(candidates.map(c => c.PoliticalPartyName)))
      .filter(Boolean)
      .sort((a, b) => {
        const idxA = PRIORITY_PARTIES.indexOf(a);
        const idxB = PRIORITY_PARTIES.indexOf(b);
        
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        
        return a.localeCompare(b);
      });
    
    // Get grouped qualifications
    const qualificationGroups = new Set(candidates.map(c => getEducationGroup(c.QUALIFICATION)));
    const qualificationHierarchy = ["Ph.D / M.Phil", "Masters", "Bachelors", "+2 / Diploma", "SLC / SEE", "Below SLC", "Literate", "Other"];
    const qualifications = [...qualificationGroups]
      .sort((a, b) => qualificationHierarchy.indexOf(a) - qualificationHierarchy.indexOf(b));
    
    const constituencies = Array.from(
      new Set(
        candidates
          .filter(c => !filters.district || c.DistrictName === filters.district)
          .map(c => c.SCConstID)
      )
    ).filter(Boolean).map(Number).sort((a, b) => a - b);

    const genders = Array.from(new Set(candidates.map(c => c.Gender))).filter(Boolean);

    return {
      provinces,
      districts,
      parties,
      qualifications,
      constituencies,
      genders,
    };
  }, [candidates, filters.province, filters.district]);
};
