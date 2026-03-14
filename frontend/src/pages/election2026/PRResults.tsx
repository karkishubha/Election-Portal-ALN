import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Vote } from "lucide-react";
import PRSeats from "@/components/results/PRSeats";
import ConstituencyFilter from "@/components/results/ConstituencyFilter";
import PRConstituencyMap from "@/components/results/PRConstituencyMap";
import { getPartyColor } from "@/lib/partyColors";
import type { ConstituencyOption } from "@/components/results/fptp-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://nepal-election-portal-api.onrender.com/api";

const STATE_FILES = [
  "ecn-pr-state-1-Koshi.json",
  "ecn-pr-state-2-Madhesh.json",
  "ecn-pr-state-3-Bagmati.json",
  "ecn-pr-state-4-Gandaki.json",
  "ecn-pr-state-5-Lumbini.json",
  "ecn-pr-state-6-Karnali.json",
  "ecn-pr-state-7-Sudurpashchim.json",
];

const STATE_NAMES: Record<number, string> = {
  1: "Koshi",
  2: "Madhesh",
  3: "Bagmati",
  4: "Gandaki",
  5: "Lumbini",
  6: "Karnali",
  7: "Sudurpashchim",
};

interface GeometryFeature {
  properties: {
    STATE_C: number;
    DCODE: number;
    F_CONST: number;
    DISTRICT?: string;
    DISTRICT_N?: string;
  };
}

interface ConstituencyGeoPayload {
  dataByDistrict?: Record<string, GeometryFeature[]>;
}

interface PRData {
  totalVotes: number;
  thresholdVotes: number;
  thresholdPercent: number;
  qualifyingParties: number;
  qualifyingVotes: number;
  totalPRSeats: number;
  parties: {
    partyName: string;
    symbolId: number;
    votes: number;
    percentage: string;
    meetsThreshold: boolean;
    seatPercentage: string;
    projectedSeats: number;
  }[];
}

interface PRPartyVote {
  PoliticalPartyName: string;
  SymbolID?: number;
  TotalVoteReceived: number;
}

interface PRConstituencyRecord {
  districtId?: number;
  constituencyNo?: number;
  parties?: PRPartyVote[];
}

interface PRConstituencyDetail {
  constituencyId: string;
  province: string;
  district: string;
  districtId?: number;
  parties: PRPartyVote[];
}

const getConstituencyKey = (item: Pick<ConstituencyOption, "state" | "district" | "id" | "districtId">): string => {
  return `${item.state}||${item.district}||${item.id}||${String(item.districtId ?? "")}`;
};

const parseConstituencyKey = (key: string): { state: string; district: string; id: string; districtId?: number } | null => {
  const [state, district, id, districtIdRaw] = key.split("||");
  if (!state || !district || !id) return null;
  const districtId = districtIdRaw ? Number(districtIdRaw) : undefined;
  return {
    state,
    district,
    id,
    districtId: Number.isFinite(districtId) ? districtId : undefined,
  };
};

const getFeatureKey = (districtId: number, constituencyId: number): string => `${districtId}-${constituencyId}`;

const getSymbolUrl = (symbolId?: number) => {
  if (!symbolId) return null;
  return `https://result.election.gov.np/Images/symbol-hor-pa/${symbolId}.jpg`;
};

const formatNumber = (num: number): string => new Intl.NumberFormat("en-NP").format(num);

const PRResults = () => {
  const [prData, setPRData] = useState<PRData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [constituencyOptions, setConstituencyOptions] = useState<ConstituencyOption[]>([]);
  const [constituencyVoteMap, setConstituencyVoteMap] = useState<Map<string, PRConstituencyDetail>>(new Map());

  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const response = await fetch(`${API_BASE_URL}/results/pr`);
        if (!response.ok) {
          throw new Error("Failed to fetch PR results");
        }
        const payload = await response.json();
        setPRData(payload);
      } catch (err) {
        setSummaryError(err instanceof Error ? err.message : "Failed to load PR summary");
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const loadConstituencyData = async () => {
      try {
        setLoading(true);

        const [geometryResponse, ...dataResponses] = await Promise.all([
          fetch("/data/fptp/ecn-constituencies-safe-2082.json"),
          ...STATE_FILES.map((fileName) => fetch(`/data/pr/${fileName}`)),
        ]);

        if (!geometryResponse.ok) {
          throw new Error("Failed to load constituency geometry");
        }

        const missingStateFile = dataResponses.find((response) => !response.ok);
        if (missingStateFile) {
          throw new Error("PR constituency files are not available yet. Run scripts/browser-fetch-pr-results-batch.js from ECN and place the downloaded files in frontend/public/data/pr/.");
        }

        const geometryPayload = (await geometryResponse.json()) as ConstituencyGeoPayload;
        const statePayloads = (await Promise.all(dataResponses.map((response) => response.json()))) as PRConstituencyRecord[][];

        const metaByKey = new Map<string, { state: string; district: string; districtId: number; constituencyId: string }>();

        Object.values(geometryPayload.dataByDistrict || {})
          .flat()
          .filter((feature) => Number(feature.properties?.F_CONST) !== 5999)
          .forEach((feature) => {
            const districtId = Number(feature.properties?.DCODE);
            const constituencyId = String(Number(feature.properties?.F_CONST));
            if (!districtId || !constituencyId) return;

            metaByKey.set(getFeatureKey(districtId, Number(constituencyId)), {
              state: STATE_NAMES[Number(feature.properties?.STATE_C)] || `Province ${feature.properties?.STATE_C}`,
              district: feature.properties?.DISTRICT || feature.properties?.DISTRICT_N || `District ${districtId}`,
              districtId,
              constituencyId,
            });
          });

        const detailMap = new Map<string, PRConstituencyDetail>();
        const optionMap = new Map<string, ConstituencyOption>();

        statePayloads.flat().forEach((record) => {
          const districtId = Number(record.districtId ?? 0);
          const constituencyId = String(record.constituencyNo ?? "");
          const parties = Array.isArray(record.parties) ? [...record.parties] : [];
          if (!districtId || !constituencyId || parties.length === 0) return;

          const key = getFeatureKey(districtId, Number(constituencyId));
          const meta = metaByKey.get(key);
          if (!meta) return;

          const sortedParties = parties
            .filter((party) => Number(party.TotalVoteReceived || 0) > 0)
            .sort((a, b) => Number(b.TotalVoteReceived || 0) - Number(a.TotalVoteReceived || 0));

          if (sortedParties.length === 0) return;

          detailMap.set(key, {
            constituencyId,
            province: meta.state,
            district: meta.district,
            districtId,
            parties: sortedParties,
          });

          const leader = sortedParties[0];
          const option: ConstituencyOption = {
            id: constituencyId,
            districtId,
            state: meta.state,
            district: meta.district,
            winner: leader.PoliticalPartyName,
            winnerParty: leader.PoliticalPartyName,
          };

          optionMap.set(getConstituencyKey(option), option);
        });

        const options = Array.from(optionMap.values()).sort((a, b) => {
          const provinceCompare = a.state.localeCompare(b.state);
          if (provinceCompare !== 0) return provinceCompare;
          const districtCompare = a.district.localeCompare(b.district);
          if (districtCompare !== 0) return districtCompare;
          return a.id.localeCompare(b.id, undefined, { numeric: true });
        });

        setConstituencyVoteMap(detailMap);
        setConstituencyOptions(options);
        setProvinces(Array.from(new Set(options.map((option) => option.state))).sort((a, b) => a.localeCompare(b)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load PR constituency results");
      } finally {
        setLoading(false);
      }
    };

    loadConstituencyData();
  }, []);

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
        const query = searchTerm.toLowerCase();
        return item.id.toLowerCase().includes(query) || item.district.toLowerCase().includes(query) || item.state.toLowerCase().includes(query);
      })
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [constituencyOptions, searchTerm, selectedDistrict, selectedProvince]);

  const selectedDetail = useMemo(() => {
    const parsed = parseConstituencyKey(selectedConstituency);
    if (!parsed || parsed.districtId === undefined) return null;
    return constituencyVoteMap.get(getFeatureKey(parsed.districtId, Number(parsed.id))) || null;
  }, [constituencyVoteMap, selectedConstituency]);

  const leaderByDistrictConst = useMemo(() => {
    const map = new Map<string, { partyName: string; symbolId?: number; votes: number; totalVotes: number }>();

    constituencyVoteMap.forEach((detail, key) => {
      if (detail.parties.length === 0) return;
      const leader = detail.parties[0];
      const totalVotes = detail.parties.reduce((sum, party) => sum + Number(party.TotalVoteReceived || 0), 0);
      map.set(key, {
        partyName: leader.PoliticalPartyName,
        symbolId: leader.SymbolID,
        votes: Number(leader.TotalVoteReceived || 0),
        totalVotes,
      });
    });

    return map;
  }, [constituencyVoteMap]);

  const topParties = useMemo(() => {
    if (!selectedDetail) return [];
    const totalVotes = selectedDetail.parties.reduce((sum, party) => sum + Number(party.TotalVoteReceived || 0), 0);

    return selectedDetail.parties.map((party, index) => ({
      ...party,
      rank: index + 1,
      percentage: totalVotes > 0 ? (Number(party.TotalVoteReceived || 0) / totalVotes) * 100 : 0,
    }));
  }, [selectedDetail]);

  const clearFilters = () => {
    setSelectedProvince("all");
    setSelectedDistrict("all");
    setSelectedConstituency("");
    setSearchTerm("");
  };

  return (
    <div className="space-y-4">
      <PRSeats data={prData} loading={summaryLoading} />

      {summaryError && (
        <Card>
          <CardContent className="py-4 text-sm text-destructive">{summaryError}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : (
        <>
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
            }}
            onDistrictChange={(value) => {
              setSelectedDistrict(value);
              setSelectedConstituency("");
            }}
            onConstituencyChange={setSelectedConstituency}
            onSearchChange={setSearchTerm}
            onClearFilters={clearFilters}
            getConstituencyValue={getConstituencyKey}
          />

          <PRConstituencyMap
            constituencyOptions={constituencyOptions}
            leaderByDistrictConst={leaderByDistrictConst}
            selectedConstituencyKey={selectedConstituency}
            getConstituencyKey={getConstituencyKey}
            getPartyColor={getPartyColor}
            onSelectConstituency={(item) => {
              setSelectedProvince(item.state);
              setSelectedDistrict(item.district);
              setSelectedConstituency(getConstituencyKey(item));
            }}
          />

          {!selectedDetail && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Select a constituency from the map to inspect PR party votes.
              </CardContent>
            </Card>
          )}

          {selectedDetail && (
            <>
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-background">
                <CardContent className="py-5">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-primary/20 bg-background/80 p-4">
                      <p className="text-xs text-muted-foreground">Province</p>
                      <p className="mt-1 font-semibold">{selectedDetail.province}</p>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-background/80 p-4">
                      <p className="text-xs text-muted-foreground">District</p>
                      <p className="mt-1 font-semibold">{selectedDetail.district}</p>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-background/80 p-4">
                      <p className="text-xs text-muted-foreground">Constituency</p>
                      <p className="mt-1 font-semibold">{selectedDetail.constituencyId}</p>
                    </div>
                    <div className="rounded-lg border border-primary/20 bg-background/80 p-4">
                      <p className="text-xs text-muted-foreground">Parties Reporting</p>
                      <p className="mt-1 font-semibold">{selectedDetail.parties.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {topParties[0] && (
                <Card>
                  <CardContent className="py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        {getSymbolUrl(topParties[0].SymbolID) ? (
                          <img
                            src={getSymbolUrl(topParties[0].SymbolID) || undefined}
                            alt={topParties[0].PoliticalPartyName}
                            className="h-16 w-16 rounded-xl border bg-white object-contain p-2"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-muted" />
                        )}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Leading Party</p>
                          <h3 className="text-lg font-semibold">{topParties[0].PoliticalPartyName}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatNumber(Number(topParties[0].TotalVoteReceived || 0))} votes ({topParties[0].percentage.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Valid Votes</p>
                          <p className="mt-1 font-semibold">{formatNumber(topParties.reduce((sum, party) => sum + Number(party.TotalVoteReceived || 0), 0))}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Lead Margin</p>
                          <p className="mt-1 font-semibold">{formatNumber(Math.max(0, Number(topParties[0].TotalVoteReceived || 0) - Number(topParties[1]?.TotalVoteReceived || 0)))}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Reporting Parties</p>
                          <p className="mt-1 font-semibold">{topParties.length}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="py-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Vote className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold">Party Vote Breakdown</h3>
                  </div>

                  <div className="space-y-3">
                    {topParties.map((party) => (
                      <div key={`${party.SymbolID}-${party.PoliticalPartyName}`} className="rounded-lg border p-3">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-white p-1">
                              {getSymbolUrl(party.SymbolID) ? (
                                <img src={getSymbolUrl(party.SymbolID) || undefined} alt={party.PoliticalPartyName} className="h-full w-full object-contain" />
                              ) : (
                                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: getPartyColor(party.PoliticalPartyName) }} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{party.PoliticalPartyName}</p>
                              <p className="mt-1 text-xs text-muted-foreground">Rank #{party.rank}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatNumber(Number(party.TotalVoteReceived || 0))}</p>
                            <p className="text-xs text-muted-foreground">{party.percentage.toFixed(2)}%</p>
                          </div>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${party.percentage}%`,
                              backgroundColor: getPartyColor(party.PoliticalPartyName),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PRResults;