import { useState, useEffect } from 'react';
import { Candidate, FilterState, AggregatedStats } from '@/types/candidates';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch candidates data from our backend proxy
 */
export const useCandidatesData = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/candidates`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch candidates data');
        }
        
        const result = await response.json();
        setCandidates(result.data || []);
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
  return candidates.filter((candidate) => {
    if (filters.province && candidate.StateName !== filters.province) return false;
    if (filters.district && candidate.DistrictName !== filters.district) return false;
    if (filters.party && candidate.PoliticalPartyName !== filters.party) return false;
    if (filters.qualification && candidate.QUALIFICATION !== filters.qualification) return false;
    if (filters.gender && candidate.Gender !== filters.gender) return false;
    if (filters.constituency && candidate.ConstName !== filters.constituency) return false;
    
    if (filters.ageMin && candidate.AGE_YR < filters.ageMin) return false;
    if (filters.ageMax && candidate.AGE_YR > filters.ageMax) return false;
    
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
};

/**
 * Get aggregated statistics from candidates
 */
export const useAggregatedStats = (candidates: Candidate[]): AggregatedStats => {
  const stats: AggregatedStats = {
    totalCandidates: candidates.length,
    byParty: {},
    byProvince: {},
    byDistrict: {},
    byGender: {},
    byQualification: {},
    byAgeGroup: {},
  };

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

    // Count by qualification
    if (candidate.QUALIFICATION) {
      stats.byQualification[candidate.QUALIFICATION] = 
        (stats.byQualification[candidate.QUALIFICATION] || 0) + 1;
    }

    // Count by age group
    const age = candidate.AGE_YR;
    let ageGroup = "65+";
    if (age >= 25 && age <= 35) ageGroup = "25-35";
    else if (age >= 36 && age <= 45) ageGroup = "36-45";
    else if (age >= 46 && age <= 55) ageGroup = "46-55";
    else if (age >= 56 && age <= 65) ageGroup = "56-65";
    
    stats.byAgeGroup[ageGroup] = (stats.byAgeGroup[ageGroup] || 0) + 1;
  });

  return stats;
};

/**
 * Get unique filter options from candidates
 */
export const useFilterOptions = (
  candidates: Candidate[],
  filters: FilterState
) => {
  const provinces = Array.from(new Set(candidates.map(c => c.StateName))).filter(Boolean).sort();
  
  const districts = Array.from(
    new Set(
      candidates
        .filter(c => !filters.province || c.StateName === filters.province)
        .map(c => c.DistrictName)
    )
  ).filter(Boolean).sort();
  
  const parties = Array.from(new Set(candidates.map(c => c.PoliticalPartyName))).filter(Boolean).sort();
  
  const qualifications = Array.from(new Set(candidates.map(c => c.QUALIFICATION))).filter(Boolean).sort();
  
  const constituencies = Array.from(
    new Set(
      candidates
        .filter(c => !filters.district || c.DistrictName === filters.district)
        .map(c => c.ConstName)
    )
  ).filter(Boolean).sort();

  return {
    provinces,
    districts,
    parties,
    qualifications,
    constituencies,
  };
};
