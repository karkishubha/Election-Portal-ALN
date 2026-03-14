import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConstituencySummaryProps {
  constituencyId: string;
  district: string;
  province: string;
  totalCandidates: number;
  totalVotes: number;
  winnerMargin: number;
}

const formatNumber = (value: number) => new Intl.NumberFormat("en-NP").format(value);

const ConstituencySummary = ({
  constituencyId,
  district,
  province,
  totalCandidates,
  totalVotes,
  winnerMargin,
}: ConstituencySummaryProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Constituency Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-lg bg-muted/40">
            <p className="text-xs text-muted-foreground">Constituency</p>
            <p className="font-semibold mt-1">{constituencyId}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40">
            <p className="text-xs text-muted-foreground">District</p>
            <p className="font-semibold mt-1">{district}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40">
            <p className="text-xs text-muted-foreground">Province</p>
            <p className="font-semibold mt-1">{province}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/40">
            <p className="text-xs text-muted-foreground">Total Candidates</p>
            <p className="font-semibold mt-1">{totalCandidates}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">Total Votes</p>
            <p className="font-semibold mt-1">{formatNumber(totalVotes)}</p>
            <Badge variant="secondary" className="mt-2">
              Winner margin: {formatNumber(winnerMargin)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConstituencySummary;
