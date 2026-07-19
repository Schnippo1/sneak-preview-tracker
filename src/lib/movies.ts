import { prisma } from "@/lib/prisma";
import { getTmdbMovieDetails } from "@/lib/tmdb";

export async function upsertMovieFromTmdb(tmdbId: number) {
  const details = await getTmdbMovieDetails(tmdbId);
  return prisma.movie.upsert({
    where: { tmdbId },
    create: details,
    update: details,
  });
}
