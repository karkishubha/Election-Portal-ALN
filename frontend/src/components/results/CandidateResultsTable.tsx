import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FPTPCandidate } from "./fptp-types";
import CandidateAvatar from "./CandidateAvatar";

interface CandidateResultsTableProps {
  candidates: FPTPCandidate[];
  totalVotes: number;
  getPartyColor: (party: string) => string;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-NP").format(value);

const CandidateResultsTable = ({ candidates, totalVotes, getPartyColor }: CandidateResultsTableProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Full Candidate Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Party</TableHead>
                <TableHead className="text-right">Votes</TableHead>
                <TableHead className="text-right">Vote %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate, idx) => {
                const votePercent = totalVotes > 0 ? (candidate.TotalVoteReceived / totalVotes) * 100 : 0;
                const rank = idx + 1;

                return (
                  <TableRow key={candidate.CandidateID} className={rank === 1 ? "bg-primary/5" : undefined}>
                    <TableCell className="font-semibold">{rank}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <CandidateAvatar
                          candidateId={candidate.CandidateID}
                          candidateName={candidate.CandidateName}
                          sizeClassName="h-9 w-9"
                        />
                        <span className="truncate">{candidate.CandidateName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-white"
                        style={{ backgroundColor: getPartyColor(candidate.PoliticalPartyName || "Independent") }}
                      >
                        {candidate.PoliticalPartyName || "Independent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(candidate.TotalVoteReceived)}</TableCell>
                    <TableCell className="text-right">{votePercent.toFixed(2)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateResultsTable;
