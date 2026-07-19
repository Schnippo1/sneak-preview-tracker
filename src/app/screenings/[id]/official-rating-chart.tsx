"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatScore, ratingValueLabels, ratingValueOrder } from "@/lib/labels";
import { computeOfficialScore } from "@/lib/stats";

export function OfficialRatingChart({
  gut,
  soLala,
  hundsmiserabel,
}: {
  gut: number;
  soLala: number;
  hundsmiserabel: number;
}) {
  const percents = { GUT: gut, SO_LALA: soLala, HUNDSMISERABEL: hundsmiserabel };
  const data = ratingValueOrder.map((value) => ({
    value,
    label: ratingValueLabels[value],
    percent: percents[value],
  }));
  const score = computeOfficialScore({
    officialGutPercent: gut,
    officialSoLalaPercent: soLala,
    officialHundsmiserabelPercent: hundsmiserabel,
  })!;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Kino-Wertung</p>
      <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        Score: {formatScore(score)}
      </p>

      <div className="mt-4 h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 32, bottom: 4, left: 4 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--chart-grid)" }}
              formatter={(value: unknown) => `${Math.round(Number(value))}%`}
              contentStyle={{
                background: "var(--chart-surface)",
                border: "1px solid var(--chart-grid)",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="percent"
              fill="var(--chart-series-1)"
              radius={4}
              barSize={20}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="percent"
                position="right"
                formatter={(value: unknown) => `${Math.round(Number(value))}%`}
                style={{ fill: "var(--chart-muted)", fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
