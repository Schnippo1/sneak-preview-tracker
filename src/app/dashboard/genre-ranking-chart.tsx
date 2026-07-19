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
import type { GenreRanking } from "@/lib/stats";

function formatScoreValue(value: unknown): string {
  return formatScore(Number(value));
}

export function GenreRankingChart({ data }: { data: GenreRanking[] }) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine ausgewerteten Vorstellungen.
      </p>
    );
  }

  const height = Math.max(120, data.length * 32);
  const selected = data.find((d) => d.genre === selectedGenre) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Auf ein Genre klicken, um die Filme dahinter zu sehen.
      </p>
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 32, bottom: 4, left: 4 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
            <XAxis type="number" hide domain={[-100, 100]} />
            <YAxis
              type="category"
              dataKey="genre"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
            />
            <ReferenceLine x={0} stroke="var(--chart-grid)" />
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
              barSize={18}
              isAnimationActive={false}
              cursor="pointer"
              onClick={(entry: { payload?: GenreRanking }) => {
                const genre = entry.payload?.genre;
                if (!genre) return;
                setSelectedGenre((current) =>
                  current === genre ? null : genre,
                );
              }}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.genre}
                  fill={
                    entry.genre === selectedGenre
                      ? "var(--chart-series-good)"
                      : "var(--chart-series-1)"
                  }
                />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                formatter={formatScoreValue}
                style={{ fill: "var(--chart-muted)", fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selected && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {selected.genre} ({selected.screeningCount})
            </p>
            <button
              type="button"
              onClick={() => setSelectedGenre(null)}
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
