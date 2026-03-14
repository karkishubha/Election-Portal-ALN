import { motion } from "framer-motion";
import { CheckCircle, XCircle, Award, Users, Vote, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getPartyColor } from "@/lib/partyColors";

interface PRParty {
  partyName: string;
  symbolId: number;
  votes: number;
  percentage: string;
  meetsThreshold: boolean;
  seatPercentage: string;
  projectedSeats: number;
}

interface PRSeatsProps {
  data: {
    totalVotes: number;
    thresholdVotes: number;
    thresholdPercent: number;
    qualifyingParties: number;
    qualifyingVotes: number;
    totalPRSeats: number;
    parties: PRParty[];
  } | null;
  loading?: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return new Intl.NumberFormat('en-NP').format(num);
};

const PRSeats = ({ data, loading }: PRSeatsProps) => {
  if (loading || !data) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const qualifyingParties = data.parties.filter(p => p.meetsThreshold);
  const nonQualifyingParties = data.parties.filter(p => !p.meetsThreshold);
  const totalAllocatedSeats = qualifyingParties.reduce((sum, p) => sum + p.projectedSeats, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Vote className="w-4 h-4" />
              <span className="text-xs">Total Votes</span>
            </div>
            <p className="text-xl font-bold">{formatNumber(data.totalVotes)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xs">PR Seats</span>
            </div>
            <p className="text-xl font-bold">{data.totalPRSeats}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs">Qualified</span>
            </div>
            <p className="text-xl font-bold">{data.qualifyingParties}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Total Parties</span>
            </div>
            <p className="text-xl font-bold">{data.parties.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Threshold Info */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="py-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {data.thresholdPercent}% Threshold Rule
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                Only parties with at least {formatNumber(data.thresholdVotes)} votes ({data.thresholdPercent}% of {formatNumber(data.totalVotes)}) are eligible for PR seats. 
                Seats are allocated proportionally among qualifying parties only.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualifying Parties - Seat Allocation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Qualifying Parties ({qualifyingParties.length})
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Total Qualifying Votes: {formatNumber(data.qualifyingVotes)} • 
            Seats: {totalAllocatedSeats}/{data.totalPRSeats}
          </p>
        </CardHeader>
        <CardContent>
          {/* Seat Distribution Bar */}
          <div className="mb-4 h-8 rounded-lg overflow-hidden flex">
            {qualifyingParties.map((party, idx) => (
              <TooltipProvider key={party.partyName}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(party.projectedSeats / data.totalPRSeats) * 100}%` }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="h-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                      style={{ backgroundColor: getPartyColor(party.partyName) }}
                    >
                      {party.projectedSeats > 5 && party.projectedSeats}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{party.partyName}</p>
                    <p className="text-xs">{party.projectedSeats} seats ({party.seatPercentage}%)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Party List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {qualifyingParties.map((party, idx) => (
              <motion.div
                key={party.partyName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: getPartyColor(party.partyName) }}
                    />
                    <span className="font-medium truncate text-sm" title={party.partyName}>
                      {party.partyName}
                    </span>
                  </div>
                  <Badge className="shrink-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {party.projectedSeats} seats
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block">Votes</span>
                    <span className="font-medium text-foreground">{formatNumber(party.votes)}</span>
                  </div>
                  <div>
                    <span className="block">Vote %</span>
                    <span className="font-medium text-foreground">{party.percentage}%</span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Seat Share</span>
                    <span>{party.seatPercentage}%</span>
                  </div>
                  <Progress value={parseFloat(party.seatPercentage)} className="h-1.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Non-Qualifying Parties */}
      {nonQualifyingParties.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Below Threshold ({nonQualifyingParties.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              These parties did not meet the {data.thresholdPercent}% threshold
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {nonQualifyingParties.slice(0, 20).map((party) => (
                <div
                  key={party.partyName}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                >
                  <span className="truncate flex-1 text-muted-foreground" title={party.partyName}>
                    {party.partyName}
                  </span>
                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span>{formatNumber(party.votes)}</span>
                    <span className="text-red-500">{party.percentage}%</span>
                  </div>
                </div>
              ))}
              {nonQualifyingParties.length > 20 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{nonQualifyingParties.length - 20} more parties
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PRSeats;
