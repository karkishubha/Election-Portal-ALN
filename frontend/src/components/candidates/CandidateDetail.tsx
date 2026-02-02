import { Candidate } from "@/types/candidates";
import { getShortPartyName } from "./charts/PartyBarChart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Calendar,
  Building,
  Briefcase,
  Flag,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CandidateDetailProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const partyColorMap: Record<string, string> = {
  "नेपाली काँग्रेस": "bg-blue-100 text-blue-800",
  "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "bg-red-100 text-red-800",
  "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "bg-rose-100 text-rose-800",
  "राष्ट्रिय स्वतन्त्र पार्टी": "bg-amber-100 text-amber-800",
  "राष्ट्रिय प्रजातन्त्र पार्टी": "bg-purple-100 text-purple-800",
  "जनता समाजवादी पार्टी, नेपाल": "bg-green-100 text-green-800",
  "स्वतन्त्र": "bg-gray-100 text-gray-800",
};

export function CandidateDetail({
  candidate,
  open,
  onOpenChange,
}: CandidateDetailProps) {
  const [imageError, setImageError] = useState(false);
  
  if (!candidate) return null;

  const shortParty = getShortPartyName(candidate.PoliticalPartyName);
  const partyColor = partyColorMap[candidate.PoliticalPartyName] || "bg-secondary text-secondary-foreground";
  const candidateImageUrl = `https://result.election.gov.np/Images/Candidate/${candidate.CandidateID}.jpg`;

  const details = [
    {
      icon: Calendar,
      label: "उमेर (Age)",
      value: `${candidate.AGE_YR} वर्ष`,
    },
    {
      icon: User,
      label: "लिङ्ग (Gender)",
      value: candidate.Gender,
    },
    {
      icon: Flag,
      label: "पार्टी (Party)",
      value: candidate.PoliticalPartyName,
    },
    {
      icon: MapPin,
      label: "प्रदेश (Province)",
      value: candidate.StateName,
    },
    {
      icon: MapPin,
      label: "जिल्ला (District)",
      value: `${candidate.DistrictName} - क्षेत्र ${candidate.SCConstID}`,
    },
    {
      icon: GraduationCap,
      label: "शैक्षिक योग्यता (Qualification)",
      value: candidate.QUALIFICATION || "N/A",
    },
    {
      icon: Building,
      label: "शिक्षण संस्था (Institution)",
      value: candidate.NAMEOFINST || "N/A",
    },
    {
      icon: Briefcase,
      label: "अनुभव (Experience)",
      value: candidate.EXPERIENCE || "N/A",
    },
    {
      icon: Home,
      label: "ठेगाना (Address)",
      value: candidate.ADDRESS || "N/A",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-start gap-4">
            {/* Large Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary shrink-0 overflow-hidden">
              {!imageError ? (
                <img 
                  src={candidateImageUrl} 
                  className="w-full h-full object-cover" 
                  alt={candidate.CandidateName}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-bold text-3xl">
                  {candidate.CandidateName.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-bold leading-tight">
                {candidate.CandidateName}
              </DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                    partyColor
                  )}
                >
                  {shortParty}
                </span>
                <span className="text-sm text-muted-foreground">
                  चिन्ह: {candidate.SymbolName}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {details.map((detail, index) => {
            const Icon = detail.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{detail.label}</p>
                  <p className="text-sm font-medium text-foreground break-words">
                    {detail.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
