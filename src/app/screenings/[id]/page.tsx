import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, screeningTypeLabels } from "@/lib/labels";
import { OfficialRatingChart } from "./official-rating-chart";

export default async function ScreeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const screening = await prisma.screening.findUnique({
    where: { id },
    include: { movie: true },
  });
  if (!screening) notFound();

  const now = new Date();
  const past = screening.date <= now;
  const hasOfficialRating =
    screening.officialGutPercent != null &&
    screening.officialSoLalaPercent != null &&
    screening.officialHundsmiserabelPercent != null;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {screeningTypeLabels[screening.type]}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          {formatDateTime(screening.date)}
        </h1>
        {screening.notes && (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{screening.notes}</p>
        )}
      </div>

      {!past && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-zinc-600 dark:text-zinc-400">
            Der Film wird erst nach der Vorstellung enthüllt. Bis dahin: genieß die
            Überraschung 🤫
          </p>
        </div>
      )}

      {past && (
        <>
          <div className="flex items-start gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            {screening.movie?.posterPath && (
              <Image
                src={`https://image.tmdb.org/t/p/w154${screening.movie.posterPath}`}
                alt={screening.movie.title}
                width={77}
                height={116}
                className="h-auto w-[77px] shrink-0 rounded"
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {screening.movie?.title ?? "Unbekannter Film"}
              </h2>
              {screening.movie?.genres && screening.movie.genres.length > 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {screening.movie.genres.join(", ")}
                </p>
              )}
              {screening.movie?.directors && screening.movie.directors.length > 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Regie: {screening.movie.directors.join(", ")}
                </p>
              )}
              {screening.movie?.overview && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {screening.movie.overview}
                </p>
              )}
            </div>
          </div>

          {hasOfficialRating ? (
            <OfficialRatingChart
              gut={screening.officialGutPercent!}
              soLala={screening.officialSoLalaPercent!}
              hundsmiserabel={screening.officialHundsmiserabelPercent!}
            />
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              Kino-Wertung liegt noch nicht vor.
            </div>
          )}
        </>
      )}
    </main>
  );
}
