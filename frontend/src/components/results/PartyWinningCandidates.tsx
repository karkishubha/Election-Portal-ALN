import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import CandidateAvatar from "./CandidateAvatar";
import type { FPTPCandidate } from "./fptp-types";

export interface PartyWinningCandidatesProps {
  partyName: string;
  candidates: FPTPCandidate[];
  getPartyColor: (party: string) => string;
  onClose: () => void;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-NP").format(value);

const PartyWinningCandidates = ({
  partyName,
  candidates,
  getPartyColor,
  onClose,
}: PartyWinningCandidatesProps) => {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <span className="truncate">{partyName}</span>
            <Badge
              className="text-white shrink-0"
              style={{ backgroundColor: getPartyColor(partyName) }}
            >
              {candidates.length} winners
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-5 py-2 bg-muted/50 border-b text-xs font-semibold text-muted-foreground shrink-0">
          <span className="w-5 shrink-0" />
          <span className="w-8 shrink-0" />
          <span className="flex-1 min-w-0">Candidate</span>
          <span className="shrink-0 w-14 text-right">Age</span>
          <span className="shrink-0 hidden sm:block w-[140px]">Constituency</span>
          <span className="shrink-0 w-20 text-right">Votes</span>
        </div>

        <div className="overflow-y-auto divide-y px-0">
          {candidates.map((candidate, index) => (
            <div
              key={candidate.CandidateID}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40 transition-colors"
            >
              <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">
                {index + 1}
              </span>
              <CandidateAvatar
                candidateId={candidate.CandidateID}
                candidateName={candidate.CandidateName}
                sizeClassName="h-8 w-8 shrink-0"
              />
              <span className="flex-1 min-w-0 text-sm font-medium truncate">
                {candidate.CandidateName}
              </span>
              <span className="text-xs text-muted-foreground shrink-0 w-14 text-right">
                {candidate.Age != null ? candidate.Age : "—"}
              </span>
              <span className="text-xs text-muted-foreground shrink-0 hidden sm:block truncate w-[140px]">
                {candidate.DistrictName} – {candidate.SCConstID}
              </span>
              <span className="text-sm font-semibold shrink-0 tabular-nums w-20 text-right">
                {formatNumber(candidate.TotalVoteReceived)}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartyWinningCandidates;