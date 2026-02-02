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

interface GenderChartProps {
  data: Record<string, number>;
  title?: string;
  titleNp?: string;
}

const GENDER_COLORS: Record<string, string> = {
  "पुरुष": "hsl(215, 55%, 45%)",
  "महिला": "hsl(350, 55%, 55%)",
  "अन्य": "hsl(270, 40%, 55%)",
};

export function GenderChart({
  data,
  title = "Gender Distribution",
  titleNp = "लिङ्ग वितरण",
}: GenderChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(data).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data]);

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

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
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                "उम्मेदवार",
              ]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={GENDER_COLORS[entry.name] || "hsl(var(--primary))"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend with percentages */}
      <div className="mt-4 flex justify-center gap-6">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: GENDER_COLORS[item.name] || "hsl(var(--primary))" }}
            />
            <span className="text-sm text-muted-foreground">
              {item.name}: {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
