import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Vote } from "lucide-react";
import ConstituencyFilter from "@/components/results/ConstituencyFilter";
import ConstituencySummary from "@/components/results/ConstituencySummary";
import TopCandidates from "@/components/results/TopCandidates";
import CandidateResultsTable from "@/components/results/CandidateResultsTable";
import PartyWinningCandidates from "@/components/results/PartyWinningCandidates";
import FPTPConstituencyMap from "@/components/results/FPTPConstituencyMap";
import ResultsSnapshot from "@/components/results/ResultsSnapshot";
import { getPartyColor } from "@/lib/partyColors";
import type {
  ConstituencyGroup,
  ConstituencyOption,
  FPTPCandidate,
} from "@/components/results/fptp-types";

interface FPTPStateRecord {
  districtId?: number;
  constituencyNo?: number;
  candidates?: FPTPCandidate[];
}

const STATE_FILES = [
  "ecn-hor-state-1-Koshi.json",
  "ecn-hor-state-2-Madhesh.json",
  "ecn-hor-state-3-Bagmati.json",
  "ecn-hor-state-4-Gandaki.json",
  "ecn-hor-state-5-Lumbini.json",
  "ecn-hor-state-6-Karnali.json",
  "ecn-hor-state-7-Sudurpashchim.json",
];

const getWinnerPartyName = (partyName: string | null): string => {
  if (!partyName || partyName.trim() === "") return "Independent / Other";
  return partyName;
};

const getConstituencyKey = (item: Pick<ConstituencyOption, "state" | "district" | "id" | "districtId">): string => {
  return `${item.state}||${item.district}||${item.id}||${String(item.districtId ?? "")}`;
};

const parseConstituencyKey = (key: string): { state: string; district: string; id: string; districtId?: number } | null => {
  const [state, district, id, districtIdRaw] = key.split("||");
  if (!state || !district || !id) return null;
  const districtId = districtIdRaw ? Number(districtIdRaw) : undefined;
  return { state, district, id, districtId: Number.isFinite(districtId) ? districtId : undefined };
};

const getGroupKeyFromSelection = (selectionKey: string): string | null => {
  const parsed = parseConstituencyKey(selectionKey);
  if (!parsed) return null;
  return `${parsed.state}||${parsed.district}||${parsed.id}`;
};

const groupCandidatesByConstituency = (candidates: FPTPCandidate[]): Record<string, ConstituencyGroup> => {
  const grouped: Record<string, ConstituencyGroup> = {};

  for (const candidate of candidates) {
    const key = `${candidate.StateName || "Unknown"}||${candidate.DistrictName || "Unknown"}||${String(candidate.SCConstID)}`;
    if (!grouped[key]) {
      grouped[key] = {
        constituencyId: String(candidate.SCConstID),
        province: candidate.StateName || "Unknown",
        district: candidate.DistrictName || "Unknown",
        candidates: [],
      };
    }
    grouped[key].candidates.push(candidate);
  }

  Object.values(grouped).forEach((group) => {
    group.candidates.sort((a, b) => b.TotalVoteReceived - a.TotalVoteReceived);
  });

  return grouped;
};

const FPTPResults = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [constituencyOptions, setConstituencyOptions] = useState<ConstituencyOption[]>([]);
  const [allCandidates, setAllCandidates] = useState<FPTPCandidate[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);

  const [selectedCandidates, setSelectedCandidates] = useState<FPTPCandidate[]>([]);

  useEffect(() => {
    const loadFromLocalStateFiles = async () => {
      try {
        setLoading(true);

        const responses = await Promise.all(
          STATE_FILES.map((fileName) => fetch(`/data/fptp/${fileName}`))
        );

        if (responses.some((res) => !res.ok)) {
          throw new Error("Failed to load one or more province result files");
        }

        const statePayloads = (await Promise.all(
          responses.map((res) => res.json())
        )) as FPTPStateRecord[][];

        const allRecords = statePayloads.flat();

        const candidates: FPTPCandidate[] = [];
        const optionMap = new Map<string, ConstituencyOption>();

        allRecords.forEach((record) => {
          const list = Array.isArray(record.candidates) ? record.candidates : [];
          if (list.length === 0) return;

          list.forEach((candidate) => candidates.push(candidate));

          const first = list[0];
          const state = first.StateName || "Unknown";
          const district = first.DistrictName || "Unknown";
          const districtId = Number(record.districtId ?? first.DistrictCd ?? 0) || undefined;
          const constituencyId = String(record.constituencyNo ?? first.SCConstID ?? "");
          if (!constituencyId) return;

          const winner = list.find((c) => c.Remarks === "Elected");
          const key = `${state}||${district}||${constituencyId}||${String(districtId ?? "")}`;

          optionMap.set(key, {
            id: constituencyId,
            districtId,
            district,
            state,
            winner: winner?.CandidateName || null,
            winnerParty: winner?.PoliticalPartyName || null,
          });
        });

        const options = Array.from(optionMap.values());
        const uniqueProvinces = Array.from(new Set(options.map((o) => o.state))).sort((a, b) => a.localeCompare(b));

        setAllCandidates(candidates);
        setConstituencyOptions(options);
        setProvinces(uniqueProvinces);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load local FPTP data files");
      } finally {
        setLoading(false);
      }
    };

    loadFromLocalStateFiles();
  }, []);

  useEffect(() => {
    if (!selectedConstituency) {
      setSelectedCandidates([]);
      return;
    }

    const parsed = parseConstituencyKey(selectedConstituency);
    if (!parsed) {
      setSelectedCandidates([]);
      return;
    }

    const filtered = allCandidates
      .filter((candidate) => candidate.StateName === parsed.state)
      .filter((candidate) => candidate.DistrictName === parsed.district)
      .filter((candidate) => String(candidate.SCConstID) === parsed.id)
      .filter((candidate) => {
        if (parsed.districtId === undefined) return true;
        return Number(candidate.DistrictCd) === parsed.districtId;
      })
      .sort((a, b) => b.TotalVoteReceived - a.TotalVoteReceived);

    setSelectedCandidates(filtered);
  }, [selectedConstituency, allCandidates]);

  const districts = useMemo(() => {
    const values = constituencyOptions
      .filter((item) => selectedProvince === "all" || item.state === selectedProvince)
      .map((item) => item.district);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [constituencyOptions, selectedProvince]);

  const filteredConstituencies = useMemo(() => {
    if (selectedDistrict === "all") {
      return [];
    }

    return constituencyOptions
      .filter((item) => selectedProvince === "all" || item.state === selectedProvince)
      .filter((item) => selectedDistrict === "all" || item.district === selectedDistrict)
      .filter((item) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
          item.id.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const districtCmp = a.district.localeCompare(b.district);
        if (districtCmp !== 0) return districtCmp;
        return a.id.localeCompare(b.id, undefined, { numeric: true });
      });
  }, [constituencyOptions, selectedProvince, selectedDistrict, searchTerm]);

  const selectedGroup = useMemo(() => {
    const grouped = groupCandidatesByConstituency(selectedCandidates);
    const groupKey = getGroupKeyFromSelection(selectedConstituency);
    if (!groupKey) return null;
    return grouped[groupKey] ?? null;
  }, [selectedCandidates, selectedConstituency]);

  const selectedConstituencyMeta = useMemo(() => {
    return constituencyOptions.find((item) => getConstituencyKey(item) === selectedConstituency) || null;
  }, [constituencyOptions, selectedConstituency]);

  const partyWiseWins = useMemo(() => {
    const counts = new Map<string, number>();

    constituencyOptions.forEach((item) => {
      const partyName = getWinnerPartyName(item.winnerParty);
      counts.set(partyName, (counts.get(partyName) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([partyName, wins]) => ({ partyName, wins }))
      .sort((a, b) => b.wins - a.wins || a.partyName.localeCompare(b.partyName));
  }, [constituencyOptions]);

  const winningCandidatesByParty = useMemo(() => {
    const elected = allCandidates
      .filter((candidate) => candidate.Remarks === "Elected")
      .sort((a, b) => b.TotalVoteReceived - a.TotalVoteReceived);

    const grouped = new Map<string, FPTPCandidate[]>();

    elected.forEach((candidate) => {
      const partyName = getWinnerPartyName(candidate.PoliticalPartyName || null);
      if (!grouped.has(partyName)) {
        grouped.set(partyName, []);
      }
      grouped.get(partyName)?.push(candidate);
    });

    return grouped;
  }, [allCandidates]);

  const winnerByDistrictConst = useMemo(() => {
    const grouped = new Map<string, FPTPCandidate>();

    allCandidates
      .filter((candidate) => candidate.Remarks === "Elected")
      .forEach((candidate) => {
        const districtId = Number(candidate.DistrictCd ?? 0);
        const constId = String(candidate.SCConstID ?? "");
        if (!districtId || !constId) return;

        const key = `${districtId}-${constId}`;
        const existing = grouped.get(key);
        if (!existing || candidate.TotalVoteReceived > existing.TotalVoteReceived) {
          grouped.set(key, candidate);
        }
      });

    return grouped;
  }, [allCandidates]);

  const clearFilters = () => {
    setSelectedProvince("all");
    setSelectedDistrict("all");
    setSelectedConstituency("");
    setSearchTerm("");
    setSelectedParty(null);
    setSelectedCandidates([]);
  };

  const totalVotes = selectedGroup
    ? selectedGroup.candidates.reduce((sum, item) => sum + item.TotalVoteReceived, 0)
    : 0;

  const winnerMargin = selectedGroup && selectedGroup.candidates.length >= 2
    ? selectedGroup.candidates[0].TotalVoteReceived - selectedGroup.candidates[1].TotalVoteReceived
    : 0;

  const winner = selectedGroup?.candidates?.[0] ?? null;
  const runnerUp = selectedGroup?.candidates?.[1] ?? null;
  const partyCount = selectedGroup
    ? new Set(selectedGroup.candidates.map((c) => c.PoliticalPartyName || "Independent")).size
    : 0;
  const independentCount = selectedGroup
    ? selectedGroup.candidates.filter((c) => !c.PoliticalPartyName || c.PoliticalPartyName === "स्वतन्त्र").length
    : 0;

  const exportSelectedConstituencyCsv = () => {
    if (!selectedGroup || selectedGroup.candidates.length === 0) return;

    const headers = ["Rank", "Candidate", "Party", "Votes", "VotePercent", "Province", "District", "Constituency"];
    const rows = selectedGroup.candidates.map((c, idx) => {
      const percent = totalVotes > 0 ? ((c.TotalVoteReceived / totalVotes) * 100).toFixed(2) : "0.00";
      return [
        String(idx + 1),
        c.CandidateName,
        c.PoliticalPartyName || "Independent",
        String(c.TotalVoteReceived),
        percent,
        c.StateName,
        c.DistrictName,
        String(c.SCConstID),
      ];
    });

    const csvText = [headers, ...rows]
      .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedGroup.province}-${selectedGroup.district}-const-${selectedGroup.constituencyId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[240px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !selectedConstituency) {
    return (
      <Card className="p-6 text-center">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ConstituencyFilter
        provinces={provinces}
        districts={districts}
        constituencies={filteredConstituencies}
        selectedProvince={selectedProvince}
        selectedDistrict={selectedDistrict}
        selectedConstituency={selectedConstituency}
        searchTerm={searchTerm}
        onProvinceChange={(value) => {
          setSelectedProvince(value);
          setSelectedDistrict("all");
          setSelectedConstituency("");
          setSelectedParty(null);
          setSelectedCandidates([]);
        }}
        onDistrictChange={(value) => {
          setSelectedDistrict(value);
          setSelectedConstituency("");
          setSelectedParty(null);
          setSelectedCandidates([]);
        }}
        onConstituencyChange={(value) => {
          setSelectedConstituency(value);
          if (value) {
            setSelectedParty(null);
          }
        }}
        onSearchChange={setSearchTerm}
        onClearFilters={clearFilters}
        getConstituencyValue={getConstituencyKey}
      />

      <FPTPConstituencyMap
        constituencyOptions={constituencyOptions}
        winnerByDistrictConst={winnerByDistrictConst}
        selectedConstituencyKey={selectedConstituency}
        getConstituencyKey={getConstituencyKey}
        getPartyColor={getPartyColor}
        onSelectConstituency={(item) => {
          setSelectedProvince(item.state);
          setSelectedDistrict(item.district);
          setSelectedConstituency(getConstituencyKey(item));
          setSelectedParty(null);
        }}
      />

      {!selectedConstituency && partyWiseWins.length > 0 && (
        <Card>
          <CardContent className="py-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold">Party-wise FPTP Wins</h3>
              <span className="text-xs text-muted-foreground">
                Constituencies Won: {constituencyOptions.length}
              </span>
            </div>

            <div className="space-y-2">
              {partyWiseWins.map((party) => {
                const share = constituencyOptions.length > 0
                  ? (party.wins / constituencyOptions.length) * 100
                  : 0;
                const isActive = selectedParty === party.partyName;

                return (
                  <button
                    type="button"
                    key={party.partyName}
                    onClick={() => setSelectedParty(party.partyName)}
                    className={`w-full rounded-md border p-3 text-left transition-colors ${
                      isActive ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate" title={party.partyName}>
                        {party.partyName}
                      </p>
                      <p className="text-sm font-semibold">{party.wins}</p>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${share}%`,
                          backgroundColor: getPartyColor(party.partyName),
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedParty && (
        <PartyWinningCandidates
          partyName={selectedParty}
          candidates={winningCandidatesByParty.get(selectedParty) || []}
          getPartyColor={getPartyColor}
          onClose={() => setSelectedParty(null)}
        />
      )}

      {selectedConstituency && selectedGroup && (
        <>
          {winner && (
            <ResultsSnapshot
              winner={winner}
              runnerUp={runnerUp}
              totalVotes={totalVotes}
              totalCandidates={selectedGroup.candidates.length}
              partyCount={partyCount}
              independentCount={independentCount}
              getPartyColor={getPartyColor}
              onExportCsv={exportSelectedConstituencyCsv}
            />
          )}

          <ConstituencySummary
            constituencyId={selectedConstituencyMeta?.id || selectedGroup.constituencyId}
            district={selectedConstituencyMeta?.district || selectedGroup.district}
            province={selectedConstituencyMeta?.state || selectedGroup.province}
            totalCandidates={selectedGroup.candidates.length}
            totalVotes={totalVotes}
            winnerMargin={winnerMargin}
          />

          <TopCandidates
            candidates={selectedGroup.candidates}
            totalVotes={totalVotes}
            getPartyColor={getPartyColor}
          />

          <CandidateResultsTable
            candidates={selectedGroup.candidates}
            totalVotes={totalVotes}
            getPartyColor={getPartyColor}
          />
        </>
      )}

      {selectedConstituency && !selectedGroup && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No candidate results found for this constituency selection.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FPTPResults;
