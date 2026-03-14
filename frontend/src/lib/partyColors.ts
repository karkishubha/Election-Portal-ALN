export const PARTY_COLORS: Record<string, string> = {
  "राष्ट्रिय स्वतन्त्र पार्टी": "#00BFFF",
  "नेपाली काँग्रेस": "#008000",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "#8B0000",
  "नेपाली कम्युनिष्ट पार्टी": "#FF0000",
  "श्रम संस्कृति पार्टी": "#A52A2A",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "#FFFF00",
  "स्वतन्त्र": "#6b7280",
  "Independent": "#6b7280",
  "Independent / Other": "#6b7280",
};

export const getPartyColor = (partyName: string): string => {
  return PARTY_COLORS[partyName] || "#6b7280";
};