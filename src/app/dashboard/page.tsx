import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  computeDirectorRankings,
  computeGenreComboRankings,
  computeGenreRankings,
  computeMonthlyPerformance,
  computeMovieRankings,
  computePolarization,
  computeQuarterlyPerformance,
  computeRatingDistribution,
  computeScoreTrend,
  computeStreaks,
  computeTmdbComparison,
  computeTypeComparison,
} from "@/lib/stats";
import { DirectorRankingTable } from "./director-ranking-table";
import { GenreComboChart } from "./genre-combo-chart";
import { GenreRankingChart } from "./genre-ranking-chart";
import { MonthlyPerformanceChart } from "./monthly-performance-chart";
import { MovieRankingTable } from "./movie-ranking-table";
import { PolarizationSection } from "./polarization-section";
import { QuarterlyBadges } from "./quarterly-badges";
import { RatingDistributionChart } from "./rating-distribution-chart";
import { ScoreTrendChart } from "./score-trend-chart";
import { StreakSection } from "./streak-section";
import { TmdbComparisonSection } from "./tmdb-comparison-section";
import { TypeComparisonChart } from "./type-comparison-chart";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function StatsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const now = new Date();

  const allScreenings = await prisma.screening.findMany({
    where: { date: { lt: now } },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      type: true,
      officialGutPercent: true,
      officialSoLalaPercent: true,
      officialHundsmiserabelPercent: true,
      movie: {
        select: {
          id: true,
          title: true,
          posterPath: true,
          genres: true,
          directors: true,
          voteAverage: true,
        },
      },
    },
  });

  const years = Array.from(
    new Set(allScreenings.map((s) => s.date.getFullYear())),
  ).sort((a, b) => b - a);
  const selectedYear =
    year && years.includes(Number(year)) ? Number(year) : null;
  const screenings = selectedYear
    ? allScreenings.filter((s) => s.date.getFullYear() === selectedYear)
    : allScreenings;

  const movieRankings = computeMovieRankings(screenings);
  const typeComparison = computeTypeComparison(screenings);
  const ratingDistribution = computeRatingDistribution(screenings);
  const genreRankings = computeGenreRankings(screenings);
  const genreComboRankings = computeGenreComboRankings(screenings);
  const directorRankings = computeDirectorRankings(screenings);
  const scoreTrend = computeScoreTrend(screenings);
  const monthlyPerformance = computeMonthlyPerformance(screenings);
  const quarterlyPerformance = computeQuarterlyPerformance(screenings);
  const streaks = computeStreaks(screenings);
  const polarization = computePolarization(screenings);
  const tmdbComparison = computeTmdbComparison(screenings);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Statistik-Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Basierend auf {screenings.length}{" "}
          {screenings.length === 1
            ? "ausgewerteter Vorstellung"
            : "ausgewerteten Vorstellungen"}
          .
        </p>
      </div>

      {years.length > 1 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/dashboard"
            className={
              selectedYear === null
                ? "rounded-full border border-zinc-950 bg-zinc-950 px-3 py-1 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                : "rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
            }
          >
            Alle Jahre
          </Link>
          {years.map((y) => (
            <Link
              key={y}
              href={`/dashboard?year=${y}`}
              className={
                selectedYear === y
                  ? "rounded-full border border-zinc-950 bg-zinc-950 px-3 py-1 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                  : "rounded-full border border-zinc-200 px-3 py-1 text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
              }
            >
              {y}
            </Link>
          ))}
        </div>
      )}

      <Section title="Filmrangliste">
        <MovieRankingTable data={movieRankings} />
      </Section>

      <Section title="Mittwoch vs. Freitag">
        <TypeComparisonChart data={typeComparison} />
      </Section>

      <Section title="Bewertungsverteilung">
        <RatingDistributionChart data={ratingDistribution} />
      </Section>

      <Section title="Monats- & Saisonmuster">
        <div className="flex flex-col gap-4">
          <MonthlyPerformanceChart data={monthlyPerformance} />
          <QuarterlyBadges data={quarterlyPerformance} />
        </div>
      </Section>

      <Section title="Serien">
        <StreakSection
          bestGoodStreak={streaks.bestGoodStreak}
          bestBadStreak={streaks.bestBadStreak}
        />
      </Section>

      <Section title="Genres">
        <GenreRankingChart data={genreRankings} />
      </Section>

      <Section title="Genre-Kombinationen">
        <GenreComboChart data={genreComboRankings} />
      </Section>

      <Section title="Meinungsschärfe">
        <PolarizationSection data={polarization} />
      </Section>

      <Section title="Regisseure">
        <DirectorRankingTable data={directorRankings} />
      </Section>

      <Section title="Wir vs. TMDB">
        <TmdbComparisonSection data={tmdbComparison} />
      </Section>

      <Section title="Verlauf über die Zeit">
        <ScoreTrendChart data={scoreTrend} />
      </Section>
    </main>
  );
}
