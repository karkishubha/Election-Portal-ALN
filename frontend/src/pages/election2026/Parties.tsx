import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidatesData } from "@/hooks/useCandidates";
import { PARTY_COLORS } from "@/types/candidates";

interface PartyStats {
  name: string;
  symbol?: string;
  fptpCount: number;
  topDistricts: string[];
}

const Election2026Parties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { candidates, isLoading, error } = useCandidatesData();

  const parties: PartyStats[] = useMemo(() => {
    const byParty: Record<string, { count: number; symbol?: string; districts: Record<string, number> }> = {};

    candidates.forEach((c) => {
      const party = c.PoliticalPartyName || "Unknown";
      if (!byParty[party]) {
        byParty[party] = { count: 0, symbol: c.SymbolName, districts: {} };
      }
      byParty[party].count += 1;
      // Prefer non-empty symbol; keep first seen
      if (!byParty[party].symbol && c.SymbolName) {
        byParty[party].symbol = c.SymbolName;
      }
      const district = c.DistrictName || "Unknown";
      byParty[party].districts[district] = (byParty[party].districts[district] || 0) + 1;
    });

    const result: PartyStats[] = Object.entries(byParty).map(([name, data]) => {
      const topDistricts = Object.entries(data.districts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([d]) => d);
      return { name, symbol: data.symbol, fptpCount: data.count, topDistricts };
    });

    // Sort by FPTP count desc, then name
    result.sort((a, b) => (b.fptpCount - a.fptpCount) || a.name.localeCompare(b.name));
    return result;
  }, [candidates]);

  const filteredParties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return parties.filter(p => p.name.toLowerCase().includes(term));
  }, [parties, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-muted/50 rounded-lg p-6 border">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-section-parties/20">
            <Users className="w-5 h-5 text-section-parties" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Political Parties (FPTP)</h2>
        </div>
        <p className="text-muted-foreground">
          Party-wise snapshot derived from the Candidates section: total FPTP candidates, top 5 districts for each party, and party symbol.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search parties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading / Error / Parties Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load candidates data</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((party, index) => (
            <motion.div
              key={party.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors"
            >
              {/* Party Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Party</div>
                  <h3 className="text-lg font-bold text-foreground">{party.name}</h3>
                  {party.symbol && (
                    <p className="mt-1 text-sm text-muted-foreground">Symbol: {party.symbol}</p>
                  )}
                </div>
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: PARTY_COLORS[party.name] || "hsl(210, 10%, 85%)" }}
                  title="Party color"
                />
              </div>

              {/* Candidate Counts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-primary/10 rounded p-3">
                  <p className="text-xs text-muted-foreground mb-1">FPTP Candidates</p>
                  <p className="text-xl font-bold text-primary">{party.fptpCount.toLocaleString()}</p>
                </div>
                <div className="bg-muted/50 rounded p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground mb-2">Top Districts</p>
                  <div className="flex flex-wrap gap-2">
                    {party.topDistricts.map((d) => (
                      <span key={d} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredParties.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No parties found matching "{searchTerm}"</p>
        </div>
      )}
    </motion.div>
  );
};

export default Election2026Parties;
