import { motion } from "framer-motion";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface Party {
  id: number;
  name: string;
  symbol: string;
  website: string;
  pmCandidate: string;
  fptpCount: number;
  prCount: number;
  constituencies: string[];
}

const Election2026Parties = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const parties: Party[] = [
    {
      id: 1,
      name: "Nepali Congress",
      symbol: "🔶",
      website: "https://nepalicongressparty.org",
      pmCandidate: "Raghuram Dhakal",
      fptpCount: 165,
      prCount: 110,
      constituencies: ["Kathmandu", "Bhaktapur", "Lalitpur", "Kaski"]
    },
    {
      id: 2,
      name: "CPN (UML)",
      symbol: "🔴",
      website: "https://cpnuml.org",
      pmCandidate: "KP Sharma Oli",
      fptpCount: 165,
      prCount: 110,
      constituencies: ["Morang", "Sunsari", "Jhapa", "Ilam"]
    },
    {
      id: 3,
      name: "CPN (Maoist Center)",
      symbol: "🟠",
      website: "https://www.maoistcenter.org",
      pmCandidate: "Pushpa Kamal Dahal",
      fptpCount: 165,
      prCount: 110,
      constituencies: ["Chitwan", "Makwanpur", "Sindhuli", "Rautahat"]
    }
  ];

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="bg-muted/50 rounded-lg p-6 border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Political Parties</h2>
        <p className="text-muted-foreground">
          This section offers information on political parties contesting in the 2026 election. 
          It includes party-wise details such as Proportional Representation (PR) lists, 
          First-Past-The-Post (FPTP) candidates, and the constituencies where candidates are contesting.
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

      {/* Parties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParties.map((party, index) => (
          <motion.div
            key={party.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-lg p-6 border hover:border-primary/50 transition-colors"
          >
            {/* Party Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-4xl mb-2">{party.symbol}</div>
                <h3 className="text-lg font-bold text-foreground">{party.name}</h3>
              </div>
              <a
                href={party.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>

            {/* PM Candidate */}
            <div className="bg-muted/50 rounded p-3 mb-4">
              <p className="text-xs text-muted-foreground mb-1">PM Candidate</p>
              <p className="font-semibold text-foreground">{party.pmCandidate}</p>
            </div>

            {/* Candidate Counts */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-primary/10 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">FPTP</p>
                <p className="text-xl font-bold text-primary">{party.fptpCount}</p>
              </div>
              <div className="bg-accent/10 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">PR</p>
                <p className="text-xl font-bold text-accent">{party.prCount}</p>
              </div>
            </div>

            {/* Constituencies */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Key Constituencies</p>
              <div className="flex flex-wrap gap-2">
                {party.constituencies.map((constituency) => (
                  <span
                    key={constituency}
                    className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded"
                  >
                    {constituency}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredParties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No parties found matching "{searchTerm}"</p>
        </div>
      )}
    </motion.div>
  );
};

export default Election2026Parties;
