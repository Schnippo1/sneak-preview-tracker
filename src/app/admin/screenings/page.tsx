import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, screeningTypeLabels } from "@/lib/labels";
import { deleteScreening } from "./actions";

export default async function AdminScreeningsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const onlyMissing = filter === "missing";

  const [screenings, totalCount, missingCount] = await Promise.all([
    prisma.screening.findMany({
      where: onlyMissing ? { movieId: null } : undefined,
      orderBy: { date: "desc" },
      include: { movie: true },
    }),
    prisma.screening.count(),
    prisma.screening.count({ where: { movieId: null } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
          Vorstellungen verwalten
        </h1>
        <Link
          href="/admin/screenings/new"
          className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Neue Vorstellung
        </Link>
      </div>

      <div className="flex gap-2 text-sm">
        <Link
          href="/admin/screenings"
          className={
            onlyMissing
              ? "rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
              : "rounded-full border border-zinc-950 bg-zinc-950 px-3 py-1 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
          }
        >
          Alle ({totalCount})
        </Link>
        <Link
          href="/admin/screenings?filter=missing"
          className={
            onlyMissing
              ? "rounded-full border border-zinc-950 bg-zinc-950 px-3 py-1 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
              : "rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
          }
        >
          Ohne Film ({missingCount})
        </Link>
      </div>

      {screenings.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Keine Vorstellungen ohne Film — alles zugeordnet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {screenings.map((screening) => (
            <li
              key={screening.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div>
                <p className="font-medium text-zinc-950 dark:text-zinc-50">
                  {formatDateTime(screening.date)} ·{" "}
                  {screeningTypeLabels[screening.type]}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {screening.movie?.title ?? "Kein Film hinterlegt"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href={`/admin/screenings/${screening.id}/edit`}
                  className="text-zinc-600 underline hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Bearbeiten
                </Link>
                <form action={deleteScreening}>
                  <input type="hidden" name="id" value={screening.id} />
                  <button
                    type="submit"
                    className="text-red-600 underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Löschen
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
