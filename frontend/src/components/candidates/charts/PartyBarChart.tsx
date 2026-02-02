import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PartyBarChartProps {
  data: Record<string, number>;
  title?: string;
  titleNp?: string;
  maxItems?: number;
}

const CHART_COLORS = [
  "hsl(215, 55%, 35%)",
  "hsl(350, 55%, 50%)",
  "hsl(160, 50%, 45%)",
  "hsl(35, 70%, 55%)",
  "hsl(270, 40%, 55%)",
  "hsl(190, 55%, 45%)",
  "hsl(25, 65%, 50%)",
  "hsl(200, 15%, 50%)",
];

// Helper to get short party name
export function getShortPartyName(fullName: string): string {
  const shortNames: Record<string, string> = {
    "नेपाली काँग्रेस": "कांग्रेस",
    "नेपाल कम्युनिष्ट पार्टी (एकीकृत मार्क्सवादी लेनिनवादी)": "एमाले",
    "नेपाल कम्युनिष्ट पार्टी (माओवादी केन्द्र)": "माओवादी",
    "राष्ट्रिय स्वतन्त्र पार्टी": "रा.स्व.पा",
    "राष्ट्रिय प्रजातन्त्र पार्टी": "राप्रपा",
    "जनता समाजवादी पार्टी, नेपाल": "जसपा",
    "जनमत पार्टी": "जनमत",
    "स्वतन्त्र": "स्वतन्त्र",
    "लोकतान्त्रिक समाजवादी पार्टी, नेपाल": "लोसपा",
    "नागरिक उन्मुक्ति पार्टी": "नागरिक",
    "राष्ट्रिय प्रजातन्त्र पार्टी (एकीकृत)": "राप्रपा एकीकृत",
  };
  return shortNames[fullName] || fullName.slice(0, 15);
}

interface ChartDataItem {
  name: string;
  shortName: string;
  value: number;
}

export function PartyBarChart({
  data,
  title = "Candidates by Party",
  titleNp = "पार्टी अनुसार उम्मेदवार",
  maxItems = 7,
}: PartyBarChartProps) {
  const chartData: ChartDataItem[] = useMemo(() => {
    return Object.entries(data)
      .map(([name, value]) => ({
        name,
        shortName: getShortPartyName(name),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);
  }, [data, maxItems]);

  return (
    <div className="bg-card rounded-xl border border-border p-4 h-full">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{titleNp}</h3>
        <p className="text-xs text-muted-foreground">{title}</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              dataKey="shortName"
              type="category"
              width={70}
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, _name: string, props: any) => [
                `${value.toLocaleString()} उम्मेदवार`,
                props.payload.name,
              ]}
              labelFormatter={() => ""}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
