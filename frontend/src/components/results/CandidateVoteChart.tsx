import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import type { FPTPCandidate } from "./fptp-types";

interface CandidateVoteChartProps {
  candidates: FPTPCandidate[];
  getPartyColor: (party: string) => string;
}

const CandidateVoteChart = ({ candidates, getPartyColor }: CandidateVoteChartProps) => {
  const chartData = candidates.map((candidate) => ({
    name: candidate.CandidateName,
    shortName: candidate.CandidateName.length > 18 ? `${candidate.CandidateName.slice(0, 18)}...` : candidate.CandidateName,
    votes: candidate.TotalVoteReceived,
    party: candidate.PoliticalPartyName,
    fill: getPartyColor(candidate.PoliticalPartyName || "Independent"),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Vote Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ votes: { label: "Votes", color: "#3b82f6" } }} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 48 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="shortName" angle={-30} textAnchor="end" interval={0} height={65} />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="votes" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CandidateVoteChart;
