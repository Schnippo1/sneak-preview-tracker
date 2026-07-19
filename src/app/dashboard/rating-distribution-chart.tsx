"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ratingValueLabels } from "@/lib/labels";
import type { RatingDistribution } from "@/lib/stats";
import type { RatingValue } from "@/lib/labels";

const COLORS: Record<RatingValue, string> = {
  GUT: "var(--chart-series-good)",
  SO_LALA: "var(--chart-series-meh)",
  HUNDSMISERABEL: "var(--chart-series-bad)",
};

export function RatingDistributionChart({
  data,
}: {
  data: RatingDistribution[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine Kino-Wertungen eingetragen.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: ratingValueLabels[d.value],
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="averagePercent"
            nameKey="label"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.value}
                fill={COLORS[entry.value]}
                stroke="var(--chart-surface)"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              `${Math.round(Number(value))}%`,
              `${name}`,
            ]}
            contentStyle={{
              background: "var(--chart-surface)",
              border: "1px solid var(--chart-grid)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--chart-muted)" }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
