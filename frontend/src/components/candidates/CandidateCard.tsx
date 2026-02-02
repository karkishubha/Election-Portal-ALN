import { Candidate } from "@/types/candidates";
import { getShortPartyName } from "./charts/PartyBarChart";
import { MapPin, GraduationCap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
  className?: string;
}

const partyColorMap: Record<string, string> = {
  "नेपाली काँग्रेस": "bg-green-100 text-green-800 border-green-200",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "bg-red-100 text-red-800 border-red-200",
  "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "bg-rose-100 text-rose-800 border-rose-200",
  "राष्ट्रिय स्वतन्त्र पार्टी": "bg-blue-100 text-blue-800 border-blue-200",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "bg-purple-100 text-purple-800 border-purple-200",
  "जनता समाजवादी पार्टी, नेपाल": "bg-green-100 text-green-800 border-green-200",
  "स्वतन्त्र": "bg-gray-100 text-gray-800 border-gray-200",
};

export function CandidateCard({ candidate, onClick, className }: CandidateCardProps) {
  const shortParty = getShortPartyName(candidate.PoliticalPartyName);
  const partyColor = partyColorMap[candidate.PoliticalPartyName] || "bg-secondary text-secondary-foreground";
  const [imageError, setImageError] = useState(false);

  const candidateImageUrl = `https://result.election.gov.np/Images/Candidate/${candidate.CandidateID}.jpg`;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="flex items-start gap-3">
        {/* Candidate Photo */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary overflow-hidden shrink-0">
          {!imageError ? (
            <img 
              src={candidateImageUrl} 
              className="w-full h-full object-cover" 
              alt={candidate.CandidateName}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-semibold text-lg">
              {candidate.CandidateName.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-sm font-medium text-foreground truncate">
            {candidate.CandidateName}
          </h3>

          {/* Party Badge */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                partyColor
              )}
            >
              {shortParty}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {candidate.SymbolName}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{candidate.DistrictName} - क्षेत्र {candidate.SCConstID}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{candidate.AGE_YR} वर्ष</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{candidate.QUALIFICATION || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}
