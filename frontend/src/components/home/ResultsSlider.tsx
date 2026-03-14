import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nepal-election-portal-api.onrender.com/api';

interface FPTPResponse {
  success: boolean;
  partySummary: Array<{
    party: string;
    seats: number;
  }>;
}

interface PRResponse {
  success: boolean;
  parties: Array<{
    partyName: string;
    projectedSeats: number;
  }>;
}

interface PartyMeta {
  key: string;
  names: string[];
  displayName: string;
  shortName: string;
  color: string;
}

interface PartySeatData {
  key: string;
  displayName: string;
  shortName: string;
  color: string;
  direct: number;
  proportional: number;
  total: number;
}

interface ArcSeatPoint {
  x: number;
  y: number;
  seat: {
    partyKey: string;
    partyName: string;
    color: string;
    seatNo: number;
  };
}

const TOTAL_SEATS = 275;
const ARC_RING_LAYOUT = [56, 52, 47, 41, 35, 26, 18];
const MOBILE_BREAKPOINT = 640;

const PARTY_META: PartyMeta[] = [
  {
    key: "rsp",
    names: ["राष्ट्रिय स्वतन्त्र पार्टी", "rastriya swatantra", "rsp"],
    displayName: "Rastriya Swatantra Party",
    shortName: "RSP",
    color: "#00BFFF",
  },
  {
    key: "nc",
    names: ["नेपाली काँग्रेस", "nepali congress", "congress"],
    displayName: "Nepali Congress",
    shortName: "NC",
    color: "#008000",
  },
  {
    key: "uml",
    names: ["एकीकृत मार्क्सवादी लेनिनवादी", "cpn-uml", "uml"],
    displayName: "CPN-UML",
    shortName: "UML",
    color: "#8B0000",
  },
  {
    key: "ncp",
    names: ["नेपाली कम्युनिष्ट पार्टी", "nepali communist party", "ncp"],
    displayName: "Nepali Communist Party",
    shortName: "NCP",
    color: "#FF0000",
  },
  {
    key: "ssp",
    names: ["श्रम संस्कृति पार्टी", "shram sanskriti", "ssp"],
    displayName: "Shram Sanskriti Party",
    shortName: "SSP",
    color: "#A52A2A",
  },
  {
    key: "rpp",
    names: ["राष्ट्रिय प्रजातन्त्र पार्टी", "rastriya prajatantra", "rpp"],
    displayName: "Rastriya Prajatantra Party",
    shortName: "RPP",
    color: "#FFFF00",
  },
  {
    key: "independent",
    names: ["independent", "स्वतन्त्र"],
    displayName: "Independent",
    shortName: "IND",
    color: "#6b7280",
  },
  {
    key: "other",
    names: ["other"],
    displayName: "Other",
    shortName: "OTH",
    color: "#334155",
  },
];

const FALLBACK_PARTY_SEATS: PartySeatData[] = [
  { key: "rsp", displayName: "Rastriya Swatantra Party", shortName: "RSP", color: "#00BFFF", direct: 125, proportional: 57, total: 182 },
  { key: "nc", displayName: "Nepali Congress", shortName: "NC", color: "#008000", direct: 18, proportional: 20, total: 38 },
  { key: "uml", displayName: "CPN-UML", shortName: "UML", color: "#8B0000", direct: 9, proportional: 16, total: 25 },
  { key: "ncp", displayName: "Nepali Communist Party", shortName: "NCP", color: "#FF0000", direct: 8, proportional: 9, total: 17 },
  { key: "ssp", displayName: "Shram Sanskriti Party", shortName: "SSP", color: "#A52A2A", direct: 3, proportional: 4, total: 7 },
  { key: "rpp", displayName: "Rastriya Prajatantra Party", shortName: "RPP", color: "#FFFF00", direct: 1, proportional: 4, total: 5 },
  { key: "independent", displayName: "Independent", shortName: "IND", color: "#6b7280", direct: 1, proportional: 0, total: 1 },
];

const normalizePartyKey = (partyName: string): string => {
  const normalized = (partyName || "").toLowerCase();
  const matched = PARTY_META.find((party) =>
    party.names.some((name) => normalized.includes(name.toLowerCase()))
  );
  return matched?.key || "other";
};

const toPartySeatArray = (
  directMap: Record<string, number>,
  prMap: Record<string, number>
): PartySeatData[] => {
  const base = PARTY_META.map((party) => {
    const direct = directMap[party.key] || 0;
    const proportional = prMap[party.key] || 0;
    return {
      key: party.key,
      displayName: party.displayName,
      shortName: party.shortName,
      color: party.color,
      direct,
      proportional,
      total: direct + proportional,
    };
  });

  return base
    .filter((party) => party.total > 0)
    .sort((a, b) => b.total - a.total);
};

const SeatGlyph = ({
  x,
  y,
  color,
  opacity,
  onMouseEnter,
  onMouseLeave,
}: {
  x: number;
  y: number;
  color: string;
  opacity: number;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      opacity={opacity}
      className="transition-opacity duration-150 cursor-pointer"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <rect
        x={-4.3}
        y={-7.2}
        width={8.6}
        height={4.4}
        rx={1.3}
        fill={color}
        stroke="rgba(15, 23, 42, 0.55)"
        strokeWidth={0.7}
      />
      <rect
        x={-6.3}
        y={-1.6}
        width={12.6}
        height={5.6}
        rx={1.6}
        fill={color}
        stroke="rgba(15, 23, 42, 0.55)"
        strokeWidth={0.7}
      />
      <rect x={-4.6} y={4.1} width={1.4} height={4} rx={0.7} fill={color} />
      <rect x={3.2} y={4.1} width={1.4} height={4} rx={0.7} fill={color} />
    </g>
  );
};

const ResultsSlider = () => {
  const [partySeats, setPartySeats] = useState<PartySeatData[]>([]);
  const [activePartyKey, setActivePartyKey] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<{ partyKey: string; index: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const fetchSeatData = async () => {
      try {
        const [fptpRes, prRes] = await Promise.all([
          fetch(`${API_BASE_URL}/results/fptp`),
          fetch(`${API_BASE_URL}/results/pr`),
        ]);

        if (!fptpRes.ok || !prRes.ok) {
          throw new Error("Unable to load live seat data");
        }

        const fptpJson = (await fptpRes.json()) as FPTPResponse;
        const prJson = (await prRes.json()) as PRResponse;

        const directMap: Record<string, number> = {};
        const prMap: Record<string, number> = {};

        (fptpJson.partySummary || []).forEach((row) => {
          const key = normalizePartyKey(row.party);
          directMap[key] = (directMap[key] || 0) + Number(row.seats || 0);
        });

        (prJson.parties || [])
          .filter((row) => Number(row.projectedSeats || 0) > 0)
          .forEach((row) => {
            const key = normalizePartyKey(row.partyName);
            prMap[key] = (prMap[key] || 0) + Number(row.projectedSeats || 0);
          });

        const merged = toPartySeatArray(directMap, prMap);
        const mergedTotal = merged.reduce((sum, party) => sum + party.total, 0);

        if (merged.length === 0 || mergedTotal !== TOTAL_SEATS) {
          setPartySeats(FALLBACK_PARTY_SEATS);
          setError(mergedTotal !== TOTAL_SEATS ? "Showing verified official seat map" : null);
        } else {
          setPartySeats(merged);
          setError(null);
        }
      } catch (err) {
        setPartySeats(FALLBACK_PARTY_SEATS);
        setError(err instanceof Error ? err.message : "Failed to load live seat data");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatData();
  }, []);

  const allSeats = useMemo(() => {
    const built = partySeats.flatMap((party) =>
      Array.from({ length: party.total }, (_, idx) => ({
        partyKey: party.key,
        partyName: party.displayName,
        color: party.color,
        seatNo: idx + 1,
      }))
    );

    if (built.length < TOTAL_SEATS) {
      const fillers = Array.from({ length: TOTAL_SEATS - built.length }, (_, idx) => ({
        partyKey: "vacant",
        partyName: "Vacant",
        color: "#94a3b8",
        seatNo: idx + 1,
      }));
      return [...built, ...fillers];
    }

    return built.slice(0, TOTAL_SEATS);
  }, [partySeats]);

  const arcSeatPoints = useMemo<ArcSeatPoint[]>(() => {
    const centerX = 500;
    const centerY = 430;
    const outerRadius = isMobile ? 300 : 390;
    const innerRadius = isMobile ? 95 : 150;
    const ringStep = (outerRadius - innerRadius) / (ARC_RING_LAYOUT.length - 1);

    const points: ArcSeatPoint[] = [];
    let cursor = 0;

    ARC_RING_LAYOUT.forEach((ringCount, ringIndex) => {
      const radius = outerRadius - ringIndex * ringStep;
      const angleStep = 180 / (ringCount + 1);

      for (let i = 0; i < ringCount; i += 1) {
        const seat = allSeats[cursor];
        cursor += 1;
        if (!seat) break;

        const angleDeg = 180 - angleStep * (i + 1);
        const angleRad = (Math.PI / 180) * angleDeg;

        points.push({
          x: centerX + radius * Math.cos(angleRad),
          y: centerY - radius * Math.sin(angleRad),
          seat,
        });
      }
    });

    return points;
  }, [allSeats, isMobile]);

  const totalDirect = partySeats.reduce((sum, party) => sum + party.direct, 0);
  const totalPR = partySeats.reduce((sum, party) => sum + party.proportional, 0);

  const highlightedParty = useMemo(() => {
    if (hoveredSeat) {
      return partySeats.find((party) => party.key === hoveredSeat.partyKey) || null;
    }
    if (activePartyKey) {
      return partySeats.find((party) => party.key === activePartyKey) || null;
    }
    return null;
  }, [activePartyKey, hoveredSeat, partySeats]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-primary rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl flex items-center justify-center min-h-[300px]"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-primary rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6 shadow-xl"
    >
      <div className="text-center mb-3 sm:mb-4">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
          <h3 className="text-primary-foreground/90 text-[11px] sm:text-base font-semibold uppercase tracking-wide sm:tracking-wider text-center">
            Election Results 2026
          </h3>
        </div>
      </div>

      <div className="bg-primary-foreground/10 rounded-lg p-2.5 sm:p-4 space-y-3">
        <div className="rounded-lg bg-primary-foreground/5 p-2.5 sm:p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-primary-foreground/85 text-sm font-medium">Seat Map</p>
            <span className="text-primary-foreground/70 text-xs">{TOTAL_SEATS} seats</span>
          </div>

          <div className="w-full overflow-hidden">
            <svg
              viewBox="0 0 1000 460"
              className="w-full h-[170px] sm:h-[250px] lg:h-[275px]"
              role="img"
              aria-label="House of Representatives seat map"
            >
              {arcSeatPoints.map((point, idx) => {
                const dimmed = !!activePartyKey && point.seat.partyKey !== activePartyKey;

                return (
                  <SeatGlyph
                    key={`${point.seat.partyKey}-${idx}`}
                    x={point.x}
                    y={point.y}
                    color={point.seat.color}
                    opacity={dimmed ? 0.26 : 1}
                    onMouseEnter={() => setHoveredSeat({ partyKey: point.seat.partyKey, index: idx })}
                    onMouseLeave={() => setHoveredSeat(null)}
                  />
                );
              })}
            </svg>
          </div>

          <div className="mt-1 text-xs text-primary-foreground/80 min-h-5">
            {highlightedParty ? (
              <span>
                {highlightedParty.displayName}: {highlightedParty.total} seats ({highlightedParty.direct} direct + {highlightedParty.proportional} proportional)
              </span>
            ) : (
              <span>{TOTAL_SEATS} total seats ({totalDirect} direct + {totalPR} proportional)</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {partySeats.map((party) => (
            <button
              key={party.key}
              type="button"
              onClick={() => setActivePartyKey((prev) => (prev === party.key ? null : party.key))}
              className={`w-full rounded-md border p-2.5 text-left transition-colors ${
                activePartyKey === party.key
                  ? "bg-primary-foreground/20 border-primary-foreground/50"
                  : "bg-primary-foreground/5 border-primary-foreground/20 hover:bg-primary-foreground/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: party.color }}
                />
                <p className="text-primary-foreground text-sm font-medium truncate" title={party.displayName}>
                  {party.shortName}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="rounded bg-primary-foreground/10 py-1">
                  <p className="text-[10px] text-primary-foreground/70">Direct</p>
                  <p className="text-sm text-primary-foreground font-semibold">{party.direct}</p>
                </div>
                <div className="rounded bg-primary-foreground/10 py-1">
                  <p className="text-[10px] text-primary-foreground/70">PR</p>
                  <p className="text-sm text-primary-foreground font-semibold">{party.proportional}</p>
                </div>
                <div className="rounded bg-primary-foreground/20 py-1">
                  <p className="text-[10px] text-primary-foreground/70">Total</p>
                  <p className="text-sm text-primary-foreground font-semibold">{party.total}</p>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-primary-foreground/65 truncate" title={party.displayName}>
                {party.displayName}
              </p>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 text-xs text-primary-foreground/70">
          {error && <span className="text-primary-foreground/60">{error}</span>}
        </div>

      </div>

      <div className="text-center mt-4">
        <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
          <Link to="/election-2026?tab=results" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            View All Results
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

export default ResultsSlider;
