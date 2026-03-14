import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trophy, Users, Flag, Vote } from "lucide-react";
import CandidateAvatar from "./CandidateAvatar";
import type { FPTPCandidate } from "./fptp-types";

interface ResultsSnapshotProps {
  winner: FPTPCandidate;
  runnerUp: FPTPCandidate | null;
  totalVotes: number;
  totalCandidates: number;
  partyCount: number;
  independentCount: number;
  getPartyColor: (party: string) => string;
  onExportCsv: () => void;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-NP").format(value);

const ResultsSnapshot = ({
  winner,
  runnerUp,
  totalVotes,
  totalCandidates,
  partyCount,
  independentCount,
  getPartyColor,
  onExportCsv,
}: ResultsSnapshotProps) => {
  const winnerPercent = totalVotes > 0 ? (winner.TotalVoteReceived / totalVotes) * 100 : 0;
  const marginVotes = runnerUp ? winner.TotalVoteReceived - runnerUp.TotalVoteReceived : 0;
  const marginPercent = totalVotes > 0 ? (marginVotes / totalVotes) * 100 : 0;

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-background">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Constituency Snapshot
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onExportCsv} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-background/80 border border-primary/20">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Winner</p>
            <div className="mt-2 flex items-center gap-3">
              <CandidateAvatar
                candidateId={winner.CandidateID}
                candidateName={winner.CandidateName}
                sizeClassName="h-14 w-14"
              />
              <div className="min-w-0">
                <p className="font-semibold truncate">{winner.CandidateName}</p>
                <Badge
                  className="mt-1 text-white"
                  style={{ backgroundColor: getPartyColor(winner.PoliticalPartyName || "Independent") }}
                >
                  {winner.PoliticalPartyName || "Independent"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatNumber(winner.TotalVoteReceived)} votes ({winnerPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background/80 border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Winning Margin</p>
            <p className="text-2xl font-bold mt-2">{formatNumber(marginVotes)}</p>
            <p className="text-sm text-muted-foreground">{marginPercent.toFixed(2)}% lead over runner-up</p>
            {runnerUp && (
              <p className="text-xs text-muted-foreground mt-2 truncate">
                Runner-up: {runnerUp.CandidateName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-background/80 border">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />Candidates</p>
              <p className="text-lg font-semibold">{totalCandidates}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/80 border">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Vote className="w-3 h-3" />Total Votes</p>
              <p className="text-lg font-semibold">{formatNumber(totalVotes)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/80 border">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Flag className="w-3 h-3" />Parties</p>
              <p className="text-lg font-semibold">{partyCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-background/80 border">
              <p className="text-xs text-muted-foreground">Independent</p>
              <p className="text-lg font-semibold">{independentCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsSnapshot;
