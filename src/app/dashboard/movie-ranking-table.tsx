"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatScore } from "@/lib/labels";
import type { MovieRanking } from "@/lib/stats";

const PREVIEW_COUNT = 5;

function MovieGroup({
  title,
  movies,
  emptyLabel,
}: {
  title: string;
  movies: MovieRanking[];
  emptyLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (movies.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {emptyLabel}
        </p>
      </div>
    );
  }

  const visible = expanded ? movies : movies.slice(0, PREVIEW_COUNT);

  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <ul className="mt-2 flex flex-col gap-2">
        {visible.map((movie, index) => (
          <li key={movie.screeningId}>
            <Link
              href={`/screenings/${movie.screeningId}`}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <span className="w-5 text-sm text-zinc-400 dark:text-zinc-500">
                {index + 1}.
              </span>
              {movie.posterPath && (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`}
                  alt={movie.title}
                  width={32}
                  height={48}
                  className="rounded"
                />
              )}
              <span className="flex-1 font-medium text-zinc-950 dark:text-zinc-50">
                {movie.title}
              </span>
              <span
                className={
                  movie.score >= 0
                    ? "text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-sm font-semibold text-red-600 dark:text-red-400"
                }
              >
                {formatScore(movie.score)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {movies.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-sm text-zinc-500 underline hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {expanded ? "Weniger anzeigen" : `Alle ${movies.length} anzeigen`}
        </button>
      )}
    </div>
  );
}

export function MovieRankingTable({ data }: { data: MovieRanking[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine ausgewerteten Vorstellungen.
      </p>
    );
  }

  const top = data.filter((movie) => movie.score >= 0);
  const flop = [...data.filter((movie) => movie.score < 0)].reverse();

  return (
    <div className="flex flex-col gap-6">
      <MovieGroup
        title="Top"
        movies={top}
        emptyLabel="Noch kein Film mit positivem Score."
      />
      <MovieGroup
        title="Flop"
        movies={flop}
        emptyLabel="Noch kein Film mit negativem Score."
      />
    </div>
  );
}
