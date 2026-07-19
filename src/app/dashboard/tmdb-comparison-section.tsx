import Link from "next/link";
import type { TmdbComparisonEntry } from "@/lib/stats";

const PREVIEW_COUNT = 5;

function formatDiff(diff: number): string {
  const rounded = Math.round(diff * 10) / 10;
  const formatted = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(rounded));
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return formatted;
}

function formatVote(vote: number): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(vote);
}

function ComparisonList({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: TmdbComparisonEntry[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Keine Daten.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {entries.slice(0, PREVIEW_COUNT).map((entry) => (
            <li key={entry.screeningId}>
              <Link
                href={`/screenings/${entry.screeningId}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                <span className="flex-1 font-medium text-zinc-950 dark:text-zinc-50">
                  {entry.title}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  wir {formatVote(entry.ourScoreAsVote)} · TMDB{" "}
                  {formatVote(entry.tmdbVoteAverage)}
                </span>
                <span
                  className={
                    entry.difference >= 0
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "font-semibold text-red-600 dark:text-red-400"
                  }
                >
                  {formatDiff(entry.difference)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TmdbComparisonSection({
  data,
}: {
  data: TmdbComparisonEntry[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Noch keine Filme mit TMDB-Wertung und Kino-Wertung gleichzeitig.
      </p>
    );
  }

  const avgDiff = data.reduce((sum, e) => sum + e.difference, 0) / data.length;
  const strictOrGenerous =
    avgDiff > 0
      ? `im Schnitt ${formatDiff(avgDiff)} Punkte großzügiger als der TMDB-Durchschnitt`
      : avgDiff < 0
        ? `im Schnitt ${formatDiff(avgDiff)} Punkte strenger als der TMDB-Durchschnitt`
        : "im Schnitt genau auf TMDB-Niveau";

  const overPerformers = data;
  const underPerformers = [...data].reverse();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Unser Publikum bewertet {strictOrGenerous} (Skala jeweils auf 0-10
        umgerechnet).
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ComparisonList
          title="Am meisten über TMDB"
          description="Bei uns deutlich besser angekommen als beim TMDB-Publikum."
          entries={overPerformers}
        />
        <ComparisonList
          title="Am meisten unter TMDB"
          description="Bei uns deutlich schlechter angekommen als beim TMDB-Publikum."
          entries={underPerformers}
        />
      </div>
    </div>
  );
}
