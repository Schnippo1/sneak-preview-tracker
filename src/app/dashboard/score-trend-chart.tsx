"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatScore, toDateInputValue } from "@/lib/labels";
import type { ScoreTrendPoint } from "@/lib/stats";

function formatScoreValue(value: unknown): string {
  return formatScore(Number(value));
}

export function ScoreTrendChart({ data }: { data: ScoreTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine ausgewerteten Vorstellungen.
      </p>
    );
  }

  const chartData = data.map((point) => ({
    date: toDateInputValue(point.date),
    title: point.title,
    score: point.score,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, bottom: 4, left: 4 }}
        >
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          />
          <YAxis
            domain={[-100, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--chart-muted)", fontSize: 11 }}
          />
          <ReferenceLine y={0} stroke="var(--chart-grid)" />
          <Tooltip
            formatter={formatScoreValue}
            labelFormatter={(_label, payload) =>
              payload?.[0]?.payload?.title ?? _label
            }
            contentStyle={{
              background: "var(--chart-surface)",
              border: "1px solid var(--chart-grid)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--chart-series-1)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--chart-series-1)" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
