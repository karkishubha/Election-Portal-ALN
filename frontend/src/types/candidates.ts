// Types for Nepal Election Candidates
// Data source: Election Commission of Nepal (result.election.gov.np)

export interface Candidate {
  CandidateID: number;
  CandidateName: string;
  Age: number;  // New field name
  AGE_YR?: number; // Legacy support
  Gender: string;
  PoliticalPartyName: string;
  SymbolName: string;
  SymbolID?: number;
  DistrictName: string;
  DistrictCd?: number;
  StateName: string;
  State?: number;
  SCConstID?: string | number; // Can be string or number
  QUALIFICATION: string;
  NAMEOFINST?: string;
  EXPERIENCE?: string;
  ADDRESS?: string;
  FATHER_NAME?: string;
  SPOUCE_NAME?: string;
  CTZDIST?: string;
  DOB?: string;
  TotalVoteReceived?: number;
  Rank?: number;
  Remarks?: string; // "Elected" or null
  SerialNo?: number;
  ElectionPost?: string;
  CastedVote?: number;
  TotalVoters?: number;
  PartyID?: number;
  CenterConstID?: string;
  Samudaya?: string;
  OTHERDETAILS?: string;
}

export interface FilterState {
  province: string | null;
  district: string | null;
  party: string | null;
  qualification: string | null;
  gender: string | null;
  constituency: number | null;
  ageMin: number | null;
  ageMax: number | null;
  searchText?: string;
}

export interface AggregatedStats {
  totalCandidates: number;
  byParty: Record<string, number>;
  byProvince: Record<string, number>;
  byDistrict: Record<string, number>;
  byGender: Record<string, number>;
  byQualification: Record<string, number>;
  byAgeGroup: Record<string, number>;
}

export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

// Province mapping for display
export const PROVINCES: Record<string, string> = {
  "कोशी प्रदेश": "Koshi Pradesh",
  "मधेश प्रदेश": "Madhesh Pradesh",
  "बागमती प्रदेश": "Bagmati Pradesh",
  "गण्डकी प्रदेश": "Gandaki Pradesh",
  "लुम्बिनी प्रदेश": "Lumbini Pradesh",
  "कर्णाली प्रदेश": "Karnali Pradesh",
  "सुदूरपश्चिम प्रदेश": "Sudurpashchim Pradesh",
};

// Color mapping for major parties
export const PARTY_COLORS: Record<string, string> = {
  "राष्ट्रिय स्वतन्त्र पार्टी": "#00BFFF", // Sky Blue (RSP)
  "नेपाली काँग्रेस": "#008000", // Green (Congress)
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "#8B0000", // Maroon (UML)
  "नेपाली कम्युनिष्ट पार्टी": "#FF0000", // Red (NCP)
  "श्रम संस्कृति पार्टी": "#A52A2A", // Brown (SSP)
  "राष्ट्रिय प्रजातन्त्र पार्टी": "#FFFF00", // Yellow (RPP)
  "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "#dc2626", // Red (Maoist)
  "जनता समाजवादी पार्टी, नेपाल": "#059669", // Teal (JSP)
  "स्वतन्त्र": "#6b7280", // Gray (Independent)
};

// Qualification levels
export const QUALIFICATIONS = [
  "साक्षर",
  "प्रा.वि. (१-५)",
  "माध्यमिक",
  "उच्च माध्यमिक",
  "स्नातक",
  "स्नातकोत्तर",
  "विद्यावारिधि",
];

// Age groups for analytics
export const AGE_GROUPS = [
  { label: "25-35", min: 25, max: 35 },
  { label: "36-45", min: 36, max: 45 },
  { label: "46-55", min: 46, max: 55 },
  { label: "56-65", min: 56, max: 65 },
  { label: "65+", min: 65, max: 100 },
];
