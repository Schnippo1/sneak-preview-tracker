"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatScore } from "@/lib/labels";
import type { MonthlyPerformance } from "@/lib/stats";

function formatScoreValue(value: unknown): string {
  return formatScore(Number(value));
}

export function MonthlyPerformanceChart({
  data,
}: {
  data: MonthlyPerformance[];
}) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const chartData = data.filter((d) => d.score !== null);

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine ausgewerteten Vorstellungen.
      </p>
    );
  }

  const selected = data.find((d) => d.month === selectedMonth) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Auf einen Monat klicken, um die Filme dahinter zu sehen.
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 8, bottom: 4, left: 4 }}
          >
            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
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
              cursor={{ fill: "var(--chart-grid)" }}
              formatter={formatScoreValue}
              contentStyle={{
                background: "var(--chart-surface)",
                border: "1px solid var(--chart-grid)",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="score"
              radius={4}
              isAnimationActive={false}
              cursor="pointer"
              onClick={(entry: { payload?: MonthlyPerformance }) => {
                const month = entry.payload?.month;
                if (!month) return;
                setSelectedMonth((current) =>
                  current === month ? null : month,
                );
              }}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={
                    entry.month === selectedMonth
                      ? "var(--chart-series-good)"
                      : "var(--chart-series-1)"
                  }
                />
              ))}
              <LabelList
                dataKey="score"
                position="top"
                formatter={formatScoreValue}
                style={{ fill: "var(--chart-muted)", fontSize: 11 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selected && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {selected.label} ({selected.screeningCount})
            </p>
            <button
              type="button"
              onClick={() => setSelectedMonth(null)}
              className="text-xs text-zinc-500 underline hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Schließen
            </button>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {selected.movies.map((movie) => (
              <li key={movie.screeningId}>
                <Link
                  href={`/screenings/${movie.screeningId}`}
                  className="flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {movie.posterPath && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                      alt={movie.title}
                      width={28}
                      height={42}
                      className="rounded"
                    />
                  )}
                  <span className="flex-1 text-sm text-zinc-950 dark:text-zinc-50">
                    {movie.title}
                  </span>
                  <span
                    className={
                      movie.score === null
                        ? "text-sm font-medium text-zinc-400 dark:text-zinc-500"
                        : movie.score >= 0
                          ? "text-sm font-medium text-emerald-600 dark:text-emerald-400"
                          : "text-sm font-medium text-red-600 dark:text-red-400"
                    }
                  >
                    {formatScore(movie.score)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
