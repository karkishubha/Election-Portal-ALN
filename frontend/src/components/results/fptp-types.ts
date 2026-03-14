export interface FPTPCandidate {
  CandidateID: number;
  CandidateName: string;
  Age?: number;
  PoliticalPartyName: string;
  DistrictCd?: number;
  DistrictName: string;
  StateName: string;
  SCConstID: string;
  TotalVoteReceived: number;
  Rank?: string;
  Remarks?: string | null;
}

export interface ConstituencyOption {
  id: string;
  districtId?: number;
  stateId?: number;
  district: string;
  state: string;
  winner: string | null;
  winnerParty: string | null;
}

export interface ConstituencyGroup {
  constituencyId: string;
  province: string;
  district: string;
  candidates: FPTPCandidate[];
}
