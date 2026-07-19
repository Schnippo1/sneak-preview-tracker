import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toDateInputValue } from "@/lib/labels";
import { ScreeningForm } from "../../screening-form";
import { updateScreening } from "../../actions";

export default async function EditScreeningPage({
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

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
        Vorstellung bearbeiten
      </h1>
      <ScreeningForm
        action={updateScreening.bind(null, id)}
        submitLabel="Speichern"
        defaultValues={{
          date: toDateInputValue(screening.date),
          type: screening.type,
          notes: screening.notes ?? "",
          officialGutPercent: screening.officialGutPercent?.toString() ?? "",
          officialSoLalaPercent: screening.officialSoLalaPercent?.toString() ?? "",
          officialHundsmiserabelPercent:
            screening.officialHundsmiserabelPercent?.toString() ?? "",
          movie: screening.movie
            ? {
                tmdbId: screening.movie.tmdbId!,
                title: screening.movie.title,
                posterPath: screening.movie.posterPath,
              }
            : null,
        }}
      />
    </main>
  );
}
