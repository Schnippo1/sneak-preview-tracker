"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { TmdbSearchResult } from "@/lib/tmdb";

type SelectedMovie = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
};

export function MovieSearch({ defaultMovie }: { defaultMovie?: SelectedMovie | null }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [selected, setSelected] = useState<SelectedMovie | null>(defaultMovie ?? null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!query.trim()) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        const data: TmdbSearchResult[] = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const visibleResults = query.trim() ? results : [];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Film (TMDB)</span>
      <input type="hidden" name="tmdbId" value={selected?.tmdbId ?? ""} />

      {selected && (
        <div className="flex items-center gap-3 rounded-md border border-zinc-300 bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-900">
          {selected.posterPath && (
            <Image
              src={`https://image.tmdb.org/t/p/w92${selected.posterPath}`}
              alt={selected.title}
              width={32}
              height={48}
              className="rounded"
            />
          )}
          <span className="flex-1 text-sm text-zinc-950 dark:text-zinc-50">{selected.title}</span>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs text-zinc-500 underline hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Ändern
          </button>
        </div>
      )}

      {!selected && (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filmtitel suchen…"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {loading && <p className="text-xs text-zinc-500 dark:text-zinc-400">Suche…</p>}
          {visibleResults.length > 0 && (
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-zinc-200 p-1 dark:border-zinc-800">
              {visibleResults.map((r) => (
                <li key={r.tmdbId}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected({ tmdbId: r.tmdbId, title: r.title, posterPath: r.posterPath });
                      setQuery("");
                      setResults([]);
                    }}
                    className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    {r.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${r.posterPath}`}
                        alt={r.title}
                        width={32}
                        height={48}
                        className="rounded"
                      />
                    ) : (
                      <div className="h-12 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
                    )}
                    <div>
                      <p className="text-sm text-zinc-950 dark:text-zinc-50">{r.title}</p>
                      {r.releaseDate && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {r.releaseDate.slice(0, 4)}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
