import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatScore, screeningTypeLabels } from "@/lib/labels";
import { computeOfficialScore } from "@/lib/stats";

export default async function DashboardPage() {
  const now = new Date();

  const upcoming = await prisma.screening.findMany({
    where: { date: { gte: now } },
    orderBy: { date: "asc" },
  });
  const past = await prisma.screening.findMany({
    where: { date: { lt: now } },
    orderBy: { date: "desc" },
    include: { movie: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <section>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Kommende Vorstellungen
        </h1>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Aktuell ist nichts geplant.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {upcoming.map((screening) => (
              <li
                key={screening.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div>
                  <p className="font-medium text-zinc-950 dark:text-zinc-50">
                    {formatDateTime(screening.date)}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {screeningTypeLabels[screening.type]}
                    {screening.notes ? ` — ${screening.notes}` : ""}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Geheim 🤫
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Vergangene Vorstellungen
        </h1>
        {past.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Noch keine vergangenen Vorstellungen.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {past.map((screening) => {
              const score = computeOfficialScore(screening);
              return (
                <li key={screening.id}>
                  <Link
                    href={`/screenings/${screening.id}`}
                    className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                  >
                    {screening.movie?.posterPath && (
                      <Image
                        src={`https://image.tmdb.org/t/p/w92${screening.movie.posterPath}`}
                        alt={screening.movie.title}
                        width={40}
                        height={60}
                        className="rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-zinc-950 dark:text-zinc-50">
                        {screening.movie?.title ?? "Unbekannter Film"}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(screening.date)} ·{" "}
                        {screeningTypeLabels[screening.type]}
                      </p>
                    </div>
                    <span
                      className={
                        score !== null
                          ? "text-sm font-medium text-emerald-600 dark:text-emerald-400"
                          : "text-sm font-medium text-amber-600 dark:text-amber-400"
                      }
                    >
                      {score !== null ? formatScore(score) : "Wertung ausstehend"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
