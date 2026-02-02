import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface QualificationPieChartProps {
  data: Record<string, number>;
  title?: string;
  titleNp?: string;
}

const CHART_COLORS = [
  "hsl(215, 55%, 35%)",
  "hsl(350, 55%, 50%)",
  "hsl(160, 50%, 45%)",
  "hsl(35, 70%, 55%)",
  "hsl(270, 40%, 55%)",
  "hsl(190, 55%, 45%)",
  "hsl(25, 65%, 50%)",
];

interface ChartDataItem {
  name: string;
  value: number;
}

export function QualificationPieChart({
  data,
  title = "Qualification Distribution",
  titleNp = "शैक्षिक योग्यता",
}: QualificationPieChartProps) {
  const chartData: ChartDataItem[] = useMemo(() => {
    return Object.entries(data)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: "11px", paddingLeft: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
