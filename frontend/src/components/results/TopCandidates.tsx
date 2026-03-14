import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FPTPCandidate } from "./fptp-types";
import CandidateAvatar from "./CandidateAvatar";

interface TopCandidatesProps {
  candidates: FPTPCandidate[];
  totalVotes: number;
  getPartyColor: (party: string) => string;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-NP").format(value);

const TopCandidates = ({ candidates, totalVotes, getPartyColor }: TopCandidatesProps) => {
  const topThree = candidates.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Top Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topThree.map((candidate, idx) => {
            const rankLabel = idx === 0 ? "1 Winner" : idx === 1 ? "2 Runner-up" : "3 Third place";
            const votePercent = totalVotes > 0 ? ((candidate.TotalVoteReceived / totalVotes) * 100).toFixed(2) : "0.00";

            return (
              <div
                key={candidate.CandidateID}
                className={`p-4 rounded-lg border ${idx === 0 ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border"}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{rankLabel}</p>
                  {idx === 0 && <Badge>Winner</Badge>}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <CandidateAvatar
                    candidateId={candidate.CandidateID}
                    candidateName={candidate.CandidateName}
                    sizeClassName="h-12 w-12"
                  />
                  <p className="font-semibold leading-tight">{candidate.CandidateName}</p>
                </div>

                <Badge
                  className="mt-2 text-white"
                  style={{ backgroundColor: getPartyColor(candidate.PoliticalPartyName || "Independent") }}
                >
                  {candidate.PoliticalPartyName || "Independent"}
                </Badge>

                <div className="mt-3">
                  <p className="font-bold text-lg">{formatNumber(candidate.TotalVoteReceived)}</p>
                  <p className="text-xs text-muted-foreground">{votePercent}% of constituency votes</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopCandidates;
