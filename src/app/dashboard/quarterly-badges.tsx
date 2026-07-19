"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatScore } from "@/lib/labels";
import type { QuarterlyPerformance } from "@/lib/stats";

const QUARTER_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Q1 · Jan-Mär",
  2: "Q2 · Apr-Jun",
  3: "Q3 · Jul-Sep",
  4: "Q4 · Okt-Dez",
};

export function QuarterlyBadges({ data }: { data: QuarterlyPerformance[] }) {
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4 | null>(
    null,
  );

  const scored = data.filter((d) => d.score !== null);
  const best =
    scored.length > 0
      ? scored.reduce((a, b) => (b.score! > a.score! ? b : a))
      : null;
  const worst =
    scored.length > 0
      ? scored.reduce((a, b) => (b.score! < a.score! ? b : a))
      : null;
  const selected = data.find((d) => d.quarter === selectedQuarter) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((q) => {
          const isBest =
            best !== null && q.quarter === best.quarter && scored.length > 1;
          const isWorst =
            worst !== null && q.quarter === worst.quarter && scored.length > 1;
          const isSelected = q.quarter === selectedQuarter;
          return (
            <button
              key={q.quarter}
              type="button"
              onClick={() =>
                setSelectedQuarter((current) =>
                  current === q.quarter ? null : q.quarter,
                )
              }
              className={
                isSelected
                  ? "rounded-lg border-2 border-zinc-950 bg-zinc-100 p-3 text-left dark:border-zinc-50 dark:bg-zinc-900"
                  : isBest
                    ? "rounded-lg border border-emerald-400 bg-emerald-50 p-3 text-left dark:border-emerald-700 dark:bg-emerald-950/40"
                    : isWorst
                      ? "rounded-lg border border-red-400 bg-red-50 p-3 text-left dark:border-red-700 dark:bg-red-950/40"
                      : "rounded-lg border border-zinc-200 bg-white p-3 text-left hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              }
            >
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {QUARTER_LABELS[q.quarter]}
              </p>
              <p
                className={
                  q.score === null
                    ? "mt-1 text-lg font-semibold text-zinc-400 dark:text-zinc-500"
                    : q.score >= 0
                      ? "mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400"
                      : "mt-1 text-lg font-semibold text-red-600 dark:text-red-400"
                }
              >
                {formatScore(q.score)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {q.screeningCount}{" "}
                {q.screeningCount === 1 ? "Vorstellung" : "Vorstellungen"}
              </p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {QUARTER_LABELS[selected.quarter]} ({selected.screeningCount})
            </p>
            <button
              type="button"
              onClick={() => setSelectedQuarter(null)}
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
