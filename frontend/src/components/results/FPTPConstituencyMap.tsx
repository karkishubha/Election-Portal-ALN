import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CandidateAvatar from "./CandidateAvatar";
import type { ConstituencyOption, FPTPCandidate } from "./fptp-types";

interface GeometryFeature {
  type: "Feature";
  properties: {
    STATE_C: number;
    DCODE: number;
    F_CONST: number;
    DISTRICT?: string;
    DISTRICT_N?: string;
    STATE_N?: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface ConstituencyGeoPayload {
  dataByDistrict?: Record<string, GeometryFeature[]>;
}

interface FPTPConstituencyMapProps {
  constituencyOptions: ConstituencyOption[];
  winnerByDistrictConst: Map<string, FPTPCandidate>;
  selectedConstituencyKey: string;
  getConstituencyKey: (item: Pick<ConstituencyOption, "state" | "district" | "id" | "districtId">) => string;
  getPartyColor: (partyName: string) => string;
  onSelectConstituency: (option: ConstituencyOption) => void;
}

const VIEWBOX_WIDTH = 980;
const VIEWBOX_HEIGHT = 560;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

type RenderFeature = GeometryFeature & {
  mapKey: string;
  option: ConstituencyOption | null;
};

const getFeatureKey = (districtId: number, constituencyId: number): string => `${districtId}-${constituencyId}`;

const FPTPConstituencyMap = ({
  constituencyOptions,
  winnerByDistrictConst,
  selectedConstituencyKey,
  getConstituencyKey,
  getPartyColor,
  onSelectConstituency,
}: FPTPConstituencyMapProps) => {
  const [features, setFeatures] = useState<RenderFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const optionsByDistrictConst = useMemo(() => {
    const map = new Map<string, ConstituencyOption>();
    constituencyOptions.forEach((item) => {
      if (item.districtId === undefined) return;
      map.set(getFeatureKey(item.districtId, Number(item.id)), item);
    });
    return map;
  }, [constituencyOptions]);

  useEffect(() => {
    let active = true;

    const loadMap = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/fptp/ecn-constituencies-safe-2082.json");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as ConstituencyGeoPayload;
        const districtData = payload.dataByDistrict || {};
        const flat = Object.values(districtData).flat();

        const usable = flat
          .filter((feature) => Number(feature.properties?.F_CONST) !== 5999)
          .map((feature) => {
            const dcode = Number(feature.properties?.DCODE);
            const fconst = Number(feature.properties?.F_CONST);
            const mapKey = getFeatureKey(dcode, fconst);
            return {
              ...feature,
              mapKey,
              option: optionsByDistrictConst.get(mapKey) || null,
            };
          })
          .filter((feature) => feature.option !== null);

        if (!active) return;
        setFeatures(usable);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load constituency map data.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMap();

    return () => {
      active = false;
    };
  }, [optionsByDistrictConst]);

  const featureCollection = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: features.map((feature) => ({
        type: "Feature" as const,
        geometry: feature.geometry,
        properties: {
          mapKey: feature.mapKey,
        },
      })),
    };
  }, [features]);

  const pathBuilder = useMemo(() => {
    if (features.length === 0) return null;

    const projection = geoMercator().fitSize([VIEWBOX_WIDTH, VIEWBOX_HEIGHT], featureCollection as any);
    return geoPath(projection);
  }, [featureCollection, features.length]);

  const hoveredFeature = useMemo(() => {
    if (!hoveredKey) return null;
    return features.find((feature) => feature.mapKey === hoveredKey) || null;
  }, [features, hoveredKey]);

  const hoveredWinner = useMemo(() => {
    if (!hoveredFeature) return null;
    const dcode = Number(hoveredFeature.properties.DCODE);
    const fconst = Number(hoveredFeature.properties.F_CONST);
    return winnerByDistrictConst.get(getFeatureKey(dcode, fconst)) || null;
  }, [hoveredFeature, winnerByDistrictConst]);

  const hoveredCentroid = useMemo(() => {
    if (!hoveredFeature || !pathBuilder) return null;
    const [x, y] = pathBuilder.centroid(hoveredFeature as any);
    return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
  }, [hoveredFeature, pathBuilder]);

  const currentViewBox = useMemo(() => {
    const width = VIEWBOX_WIDTH / zoom;
    const height = VIEWBOX_HEIGHT / zoom;
    return {
      x: (VIEWBOX_WIDTH - width) / 2,
      y: (VIEWBOX_HEIGHT - height) / 2,
      width,
      height,
    };
  }, [zoom]);

  const tooltipStyle = useMemo(() => {
    if (!hoveredCentroid) return null;
    const left = ((hoveredCentroid.x - currentViewBox.x) / currentViewBox.width) * 100;
    const top = ((hoveredCentroid.y - currentViewBox.y) / currentViewBox.height) * 100;
    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    return {
      left: `${clamp(left, 12, 88)}%`,
      top: `${clamp(top, 16, 94)}%`,
    };
  }, [currentViewBox.height, currentViewBox.width, currentViewBox.x, currentViewBox.y, hoveredCentroid]);

  return (
    <Card>
      <CardContent className="py-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Interactive Constituency Map</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Click a constituency to load details</span>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((value) => Math.max(MIN_ZOOM, Number((value - 0.5).toFixed(1))))} disabled={zoom <= MIN_ZOOM}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((value) => Math.min(MAX_ZOOM, Number((value + 0.5).toFixed(1))))} disabled={zoom >= MAX_ZOOM}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(1)} disabled={zoom === 1}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative rounded-md border bg-muted/10 p-2">
          {loading && <div className="text-sm text-muted-foreground p-4">Loading map...</div>}
          {error && !loading && <div className="text-sm text-destructive p-4">{error}</div>}

          {!loading && !error && pathBuilder && (
            <svg viewBox={`${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`} className="w-full h-auto max-h-[620px]">
              <g>
                {features.map((feature) => {
                  const path = pathBuilder(feature as any);
                  if (!path || !feature.option) return null;

                  const optionKey = getConstituencyKey(feature.option);
                  const isSelected = optionKey === selectedConstituencyKey;
                  const winnerParty = feature.option.winnerParty || "Independent / Other";
                  const fill = getPartyColor(winnerParty);

                  return (
                    <path
                      key={feature.mapKey}
                      d={path}
                      fill={fill}
                      fillOpacity={isSelected ? 0.95 : 0.72}
                      stroke={isSelected ? "#111827" : "#ffffff"}
                      strokeWidth={isSelected || hoveredKey === feature.mapKey ? 1.8 : 0.5}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredKey(feature.mapKey)}
                      onMouseLeave={() => setHoveredKey((current) => (current === feature.mapKey ? null : current))}
                      onClick={() => onSelectConstituency(feature.option as ConstituencyOption)}
                    />
                  );
                })}
              </g>
            </svg>
          )}

          {hoveredFeature?.option && tooltipStyle && (
            <div
              className="pointer-events-none absolute z-10 w-72 max-w-[calc(100%-1rem)] rounded-md border bg-background/95 p-3 shadow-lg"
              style={{
                left: tooltipStyle.left,
                top: tooltipStyle.top,
                transform: "translate(-50%, calc(-100% - 10px))",
              }}
            >
              <div className="flex items-start gap-3">
                {hoveredWinner ? (
                  <CandidateAvatar
                    candidateId={hoveredWinner.CandidateID}
                    candidateName={hoveredWinner.CandidateName}
                    sizeClassName="h-12 w-12"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-muted shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {hoveredWinner?.CandidateName || hoveredFeature.option.winner || "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {hoveredFeature.option.state} · {hoveredFeature.option.district} - {hoveredFeature.option.id}
                  </p>
                  <p className="text-xs mt-1 truncate">
                    <span className="text-muted-foreground">Party:</span>{" "}
                    {hoveredWinner?.PoliticalPartyName || hoveredFeature.option.winnerParty || "Independent / Other"}
                  </p>
                  {hoveredWinner && (
                    <p className="text-xs mt-1">
                      <span className="text-muted-foreground">Votes:</span>{" "}
                      {new Intl.NumberFormat("en-NP").format(hoveredWinner.TotalVoteReceived)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FPTPConstituencyMap;
