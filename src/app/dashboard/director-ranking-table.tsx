"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatScore } from "@/lib/labels";
import type { DirectorRanking } from "@/lib/stats";

export function DirectorRankingTable({ data }: { data: DirectorRanking[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) {
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selected]);

  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine ausgewerteten Vorstellungen.
      </p>
    );
  }

  const selectedRanking = data.find((d) => d.director === selected) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Auf eine:n Regisseur:in klicken, um die Filme dahinter zu sehen.
      </p>

      {selectedRanking && (
        <div
          ref={panelRef}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {selectedRanking.director}
            </p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-zinc-500 underline hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Schließen
            </button>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {selectedRanking.movies.map((movie) => (
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

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-2 font-medium">Regisseur:in</th>
              <th className="px-4 py-2 font-medium">Häufigkeit</th>
              <th className="px-4 py-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((director) => (
              <tr
                key={director.director}
                onClick={() =>
                  setSelected((current) =>
                    current === director.director ? null : director.director,
                  )
                }
                className={
                  director.director === selected
                    ? "cursor-pointer border-b border-zinc-100 bg-zinc-100 last:border-0 dark:border-zinc-900 dark:bg-zinc-900"
                    : "cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900"
                }
              >
                <td className="px-4 py-2 text-zinc-950 dark:text-zinc-50">
                  {director.director}
                </td>
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                  {director.frequency}×
                </td>
                <td
                  className={
                    director.score === null
                      ? "px-4 py-2 font-medium text-zinc-400 dark:text-zinc-500"
                      : director.score >= 0
                        ? "px-4 py-2 font-medium text-emerald-600 dark:text-emerald-400"
                        : "px-4 py-2 font-medium text-red-600 dark:text-red-400"
                  }
                >
                  {formatScore(director.score)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
