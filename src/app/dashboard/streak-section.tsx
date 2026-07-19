import Link from "next/link";
import { formatDateTime, formatScore } from "@/lib/labels";
import {
  BAD_STREAK_THRESHOLD,
  GOOD_STREAK_THRESHOLD,
  type Streak,
} from "@/lib/stats";

function StreakCard({
  title,
  description,
  streak,
  emptyLabel,
  colorClass,
}: {
  title: string;
  description: string;
  streak: Streak | null;
  emptyLabel: string;
  colorClass: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      {streak === null ? (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {emptyLabel}
        </p>
      ) : (
        <>
          <p className={`mt-2 text-2xl font-bold ${colorClass}`}>
            {streak.length}{" "}
            {streak.length === 1 ? "Vorstellung" : "Vorstellungen"} in Folge
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formatDateTime(streak.startDate)} –{" "}
            {formatDateTime(streak.endDate)}
          </p>
          <ul className="mt-3 flex flex-col gap-1">
            {streak.movies.map((movie) => (
              <li key={movie.screeningId} className="text-sm">
                <Link
                  href={`/screenings/${movie.screeningId}`}
                  className="text-zinc-700 underline hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
                >
                  {movie.title}
                </Link>{" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  ({formatScore(movie.score)})
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function StreakSection({
  bestGoodStreak,
  bestBadStreak,
}: {
  bestGoodStreak: Streak | null;
  bestBadStreak: Streak | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StreakCard
        title="Beste Serie"
        description={`Score ≥ ${GOOD_STREAK_THRESHOLD} in Folge`}
        streak={bestGoodStreak}
        emptyLabel={`Noch keine Serie mit Score ≥ ${GOOD_STREAK_THRESHOLD} erreicht.`}
        colorClass="text-emerald-600 dark:text-emerald-400"
      />
      <StreakCard
        title="Schlechteste Serie"
        description={`Score < ${BAD_STREAK_THRESHOLD} in Folge`}
        streak={bestBadStreak}
        emptyLabel={`Noch keine Serie mit Score < ${BAD_STREAK_THRESHOLD} erreicht.`}
        colorClass="text-red-600 dark:text-red-400"
      />
    </div>
  );
}
