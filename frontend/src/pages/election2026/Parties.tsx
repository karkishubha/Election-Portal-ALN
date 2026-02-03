import { motion } from "framer-motion";
import { Search, Users, Download, Clipboard, FileText, ExternalLink, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCandidatesData } from "@/hooks/useCandidates";
import { usePoliticalParties } from "@/hooks/useQueries";
import { partiesApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PartyStats {
  name: string;
  symbolText?: string;
  symbolImageUrl?: string;
  fptpCount: number;
  topDistricts: string[];
  partyId?: number;
  hasManifestoPdf?: boolean;
  website?: string;
}

const Election2026Parties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; partyName: string } | null>(null);
  const { candidates, isLoading, error } = useCandidatesData();
  const { data: partiesResp } = usePoliticalParties(1);
  
  const openPdfViewer = (partyId: number, partyName: string) => {
    const url = partiesApi.getManifestoUrl(partyId);
    setSelectedPdf({ url, partyName });
    setPdfViewerOpen(true);
  };
  
  const getNameClass = (name: string) => {
    const len = (name || "").length;
    if (len > 45) return "text-sm md:text-base";
    if (len > 30) return "text-base md:text-lg";
    return "text-lg md:text-xl";
  };
  
  // Build a map from party API data
  const partyApiData = useMemo(() => {
    const items = partiesResp?.data || [];
    return items.map(p => ({
      id: p.id,
      partyName: p.partyName,
      partyNameNepali: p.partyNameNepali,
      abbreviation: p.abbreviation,
      hasManifestoPdf: p.hasManifestoPdf || !!p.manifestoPdfFilename,
      website: p.officialWebsite,
      symbolImageUrl: p.partySymbolUrl,
    }));
  }, [partiesResp]);

  // Function to find matching party info
  const findPartyInfo = (name: string) => {
    const norm = (s?: string) => (s || "").trim().toLowerCase().replace(/\s+/g, ' ');
    const normName = norm(name);
    
    for (const p of partyApiData) {
      const normNepali = norm(p.partyNameNepali);
      const normEng = norm(p.partyName);
      const normAbbr = norm(p.abbreviation);
      
      // Exact match
      if (normNepali === normName || normEng === normName || normAbbr === normName) {
        return { partyId: p.id, hasManifestoPdf: p.hasManifestoPdf, website: p.website, symbolImageUrl: p.symbolImageUrl };
      }
      // Contains match (for parties with parentheses variations)
      if (normNepali && (normName.includes(normNepali) || normNepali.includes(normName))) {
        return { partyId: p.id, hasManifestoPdf: p.hasManifestoPdf, website: p.website, symbolImageUrl: p.symbolImageUrl };
      }
      if (normEng && (normName.includes(normEng) || normEng.includes(normName))) {
        return { partyId: p.id, hasManifestoPdf: p.hasManifestoPdf, website: p.website, symbolImageUrl: p.symbolImageUrl };
      }
    }
    return {};
  };

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
      const info = findPartyInfo(name);
      return {
        name,
        symbolText: data.symbol,
        symbolImageUrl: info.symbolImageUrl,
        partyId: info.partyId,
        hasManifestoPdf: info.hasManifestoPdf,
        website: info.website,
        fptpCount: data.count,
        topDistricts,
      };
    });

    // Sort by FPTP count desc, then name
    result.sort((a, b) => (b.fptpCount - a.fptpCount) || a.name.localeCompare(b.name));
    return result;
  }, [candidates, partyApiData]);

  const filteredParties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return parties.filter(p => p.name.toLowerCase().includes(term));
  }, [parties, searchTerm]);

  const exportPartiesCSV = () => {
    const headers = ['Party Name','FPTP Count','Top Districts','Website'];
    const escape = (val: string) => {
      const v = (val || '').replace(/"/g, '""');
      return v.includes(',') || v.includes('\n') ? `"${v}"` : v;
    };
    const rows = parties.map(p => [
      escape(p.name),
      String(p.fptpCount),
      escape(p.topDistricts.join('; ')),
      escape(p.website || ''),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parties-list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPartiesJSON = async () => {
    const exportList = parties.map(p => ({
      name: p.name,
      fptpCount: p.fptpCount,
      topDistricts: p.topDistricts,
      hasManifestoPdf: p.hasManifestoPdf,
      website: p.website,
    }));
    try {
      await navigator.clipboard.writeText(JSON.stringify(exportList, null, 2));
      // Optional: you can add a toast if desired
    } catch (e) {
      console.error('Failed to copy parties JSON:', e);
    }
  };

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

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search parties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportPartiesCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" onClick={copyPartiesJSON}>
            <Clipboard className="w-4 h-4 mr-2" /> Copy JSON
          </Button>
        </div>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredParties.map((party, index) => (
            <motion.div
              key={party.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-7 border hover:border-primary/50 transition-colors space-y-5"
            >
              {/* Party Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Hide symbol for 'स्वतन्त्र' */}
                  {party.name.trim() !== 'स्वतन्त्र' && (
                    party.symbolImageUrl ? (
                      <img src={party.symbolImageUrl} alt={party.name} className="w-9 h-9 rounded" />
                    ) : (
                      party.symbolText ? (
                        <div className="min-w-9 min-h-9 rounded bg-muted flex items-center justify-center px-2 py-1 text-xs text-muted-foreground">
                          {party.symbolText}
                        </div>
                      ) : null
                    )
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">Party</div>
                    <h3
                      className={`${getNameClass(party.name)} font-bold text-foreground leading-snug`}
                      title={party.name}
                    >
                      {party.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Candidate Counts (compact) */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted-foreground">FPTP Candidates</span>
                  <span className="text-2xl font-bold text-foreground leading-tight">{party.fptpCount.toLocaleString()}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Top Districts</p>
                  <div className="flex flex-wrap gap-2">
                    {party.topDistricts.map((d) => (
                      <span key={d} className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-md">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manifesto / Website (compact links) */}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {/* View Manifesto PDF Button */}
                {party.partyId && party.hasManifestoPdf ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 w-fit"
                    onClick={() => openPdfViewer(party.partyId!, party.name)}
                  >
                    <FileText className="w-4 h-4" />
                    View Manifesto (PDF)
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Manifesto PDF not available
                  </span>
                )}
                
                {/* Website Link */}
                {party.website && (
                  <a 
                    href={party.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline truncate max-w-full flex items-center gap-1"
                    title={party.website}
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {party.website}
                  </a>
                )}
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

      {/* PDF Viewer Dialog */}
      <Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
        <DialogContent className="max-w-5xl h-[85vh] p-0">
          <DialogHeader className="p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {selectedPdf?.partyName} - Manifesto
              </DialogTitle>
              <a 
                href={selectedPdf?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1 mr-8"
              >
                <ExternalLink className="w-4 h-4" />
                Open in new tab
              </a>
            </div>
          </DialogHeader>
          <div className="flex-1 h-full p-2">
            {selectedPdf && (
              selectedPdf.url.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={selectedPdf.url}
                  className="w-full h-[calc(85vh-80px)] rounded border"
                  title={`${selectedPdf.partyName} Manifesto`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[calc(85vh-80px)] bg-muted/50 rounded border">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">External Link</p>
                  <p className="text-muted-foreground text-center mb-4 px-4">
                    This manifesto is hosted on an external website and cannot be displayed here.
                  </p>
                  <Button asChild>
                    <a href={selectedPdf.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Manifesto Website
                    </a>
                  </Button>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Election2026Parties;
