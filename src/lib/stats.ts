import type { ScreeningType } from "@/generated/prisma/client";
import { ratingValueOrder, type RatingValue } from "@/lib/labels";

export type ScreeningStats = {
  id: string;
  date: Date;
  type: ScreeningType;
  officialGutPercent: number | null;
  officialSoLalaPercent: number | null;
  officialHundsmiserabelPercent: number | null;
  movie: {
    id: string;
    title: string;
    posterPath: string | null;
    genres: string[];
    directors: string[];
    voteAverage: number | null;
  } | null;
};

const RATING_POINTS: Record<RatingValue, number> = {
  GUT: 1,
  SO_LALA: 0.5,
  HUNDSMISERABEL: -1,
};

/**
 * Score aus den drei vom Kino veröffentlichten Prozentwerten (0-100 je
 * Kategorie, sollten in Summe ~100 ergeben) -> Range -100..+100. Nur
 * berechenbar wenn alle drei Werte gesetzt sind.
 */
export function computeOfficialScore(screening: {
  officialGutPercent: number | null;
  officialSoLalaPercent: number | null;
  officialHundsmiserabelPercent: number | null;
}): number | null {
  const {
    officialGutPercent: g,
    officialSoLalaPercent: s,
    officialHundsmiserabelPercent: h,
  } = screening;
  if (g == null || s == null || h == null) return null;
  return (
    g * RATING_POINTS.GUT +
    s * RATING_POINTS.SO_LALA +
    h * RATING_POINTS.HUNDSMISERABEL
  );
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Ein Film innerhalb einer Gruppierung (Genre, Regisseur:in, Typ, Monat,
 * ...). score ist null, wenn für diese Vorstellung noch keine Kino-Wertung
 * eingetragen wurde - die Vorstellung wird trotzdem aufgelistet.
 */
export type RankedMovie = {
  screeningId: string;
  title: string;
  posterPath: string | null;
  score: number | null;
};

export type MovieRanking = {
  screeningId: string;
  movieId: string;
  title: string;
  posterPath: string | null;
  date: Date;
  score: number;
};

export function computeMovieRankings(
  screenings: ScreeningStats[],
): MovieRanking[] {
  const rankings: MovieRanking[] = [];
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const score = computeOfficialScore(screening);
    if (score === null) continue;
    rankings.push({
      screeningId: screening.id,
      movieId: screening.movie.id,
      title: screening.movie.title,
      posterPath: screening.movie.posterPath,
      date: screening.date,
      score,
    });
  }
  return rankings.sort((a, b) => b.score - a.score);
}

export type TypeComparison = {
  type: ScreeningType;
  score: number | null;
  screeningCount: number;
  movies: RankedMovie[];
};

export function computeTypeComparison(
  screenings: ScreeningStats[],
): TypeComparison[] {
  const byType = new Map<
    ScreeningType,
    { scores: number[]; movies: RankedMovie[] }
  >();
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const entry = byType.get(screening.type) ?? { scores: [], movies: [] };
    const score = computeOfficialScore(screening);
    if (score !== null) entry.scores.push(score);
    entry.movies.push({
      screeningId: screening.id,
      title: screening.movie.title,
      posterPath: screening.movie.posterPath,
      score,
    });
    byType.set(screening.type, entry);
  }
  return Array.from(byType.entries()).map(([type, { scores, movies }]) => ({
    type,
    score: scores.length > 0 ? average(scores) : null,
    screeningCount: movies.length,
    movies: [...movies].sort(
      (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
    ),
  }));
}

export type RatingDistribution = {
  value: RatingValue;
  averagePercent: number;
};

/**
 * Durchschnitt der drei Kino-Prozentwerte über alle Screenings mit
 * vollständiger Kino-Wertung (Summe der drei averagePercent ≈ 100).
 */
export function computeRatingDistribution(
  screenings: ScreeningStats[],
): RatingDistribution[] {
  const sums: Record<RatingValue, number> = {
    GUT: 0,
    SO_LALA: 0,
    HUNDSMISERABEL: 0,
  };
  let n = 0;
  for (const screening of screenings) {
    if (
      screening.officialGutPercent == null ||
      screening.officialSoLalaPercent == null ||
      screening.officialHundsmiserabelPercent == null
    ) {
      continue;
    }
    sums.GUT += screening.officialGutPercent;
    sums.SO_LALA += screening.officialSoLalaPercent;
    sums.HUNDSMISERABEL += screening.officialHundsmiserabelPercent;
    n += 1;
  }
  if (n === 0) return [];
  return ratingValueOrder.map((value) => ({
    value,
    averagePercent: sums[value] / n,
  }));
}

/**
 * Ein Screening mit mehreren Genres zählt in JEDEN zugehörigen Genre-Bucket
 * (kein Splitten/Gewichten). Der Score eines Genres wird nur aus den
 * ausgewerteten Vorstellungen gemittelt, die Filmliste enthält aber ALLE
 * Vorstellungen dieses Genres - auch noch nicht bewertete (score: null).
 */
export type GenreRanking = {
  genre: string;
  score: number;
  screeningCount: number;
  movies: RankedMovie[];
};

export function computeGenreRankings(
  screenings: ScreeningStats[],
): GenreRanking[] {
  const byGenre = new Map<
    string,
    { scores: number[]; movies: RankedMovie[] }
  >();
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const score = computeOfficialScore(screening);
    for (const genre of screening.movie.genres) {
      const entry = byGenre.get(genre) ?? { scores: [], movies: [] };
      if (score !== null) entry.scores.push(score);
      entry.movies.push({
        screeningId: screening.id,
        title: screening.movie.title,
        posterPath: screening.movie.posterPath,
        score,
      });
      byGenre.set(genre, entry);
    }
  }
  return Array.from(byGenre.entries())
    .filter(([, { scores }]) => scores.length > 0)
    .map(([genre, { scores, movies }]) => ({
      genre,
      score: average(scores),
      screeningCount: movies.length,
      movies: [...movies].sort(
        (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Score pro ungeordnetem Genre-Paar (z. B. "Horror + Komödie"), damit
 * Genre-Kombinationen sichtbar werden statt nur Einzelgenres. Nur Paare mit
 * mindestens 2 Vorstellungen (bewertet oder nicht) werden gezeigt, um
 * Ein-Film-Zufallstreffer herauszufiltern; der Score wird nur aus den
 * bewerteten Vorstellungen gemittelt.
 */
export type GenreComboRanking = {
  label: string;
  genres: [string, string];
  score: number;
  screeningCount: number;
  movies: RankedMovie[];
};

function genrePairs(genres: string[]): [string, string][] {
  const unique = Array.from(new Set(genres)).sort((a, b) =>
    a.localeCompare(b, "de"),
  );
  const pairs: [string, string][] = [];
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      pairs.push([unique[i], unique[j]]);
    }
  }
  return pairs;
}

export function computeGenreComboRankings(
  screenings: ScreeningStats[],
): GenreComboRanking[] {
  const byCombo = new Map<
    string,
    { genres: [string, string]; scores: number[]; movies: RankedMovie[] }
  >();
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const score = computeOfficialScore(screening);
    for (const pair of genrePairs(screening.movie.genres)) {
      const key = pair.join("__");
      const entry = byCombo.get(key) ?? {
        genres: pair,
        scores: [],
        movies: [],
      };
      if (score !== null) entry.scores.push(score);
      entry.movies.push({
        screeningId: screening.id,
        title: screening.movie.title,
        posterPath: screening.movie.posterPath,
        score,
      });
      byCombo.set(key, entry);
    }
  }
  return Array.from(byCombo.values())
    .filter((entry) => entry.movies.length >= 2 && entry.scores.length > 0)
    .map((entry) => ({
      label: entry.genres.join(" + "),
      genres: entry.genres,
      score: average(entry.scores),
      screeningCount: entry.movies.length,
      movies: [...entry.movies].sort(
        (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
      ),
    }))
    .sort((a, b) => b.score - a.score);
}

/** Primärer Sortierschlüssel ist die Häufigkeit (Anzahl Screenings), Score als Zusatzinfo. */
export type DirectorRanking = {
  director: string;
  frequency: number;
  score: number | null;
  movies: RankedMovie[];
};

export function computeDirectorRankings(
  screenings: ScreeningStats[],
): DirectorRanking[] {
  const byDirector = new Map<
    string,
    { scores: number[]; movies: RankedMovie[] }
  >();
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const score = computeOfficialScore(screening);
    for (const director of screening.movie.directors) {
      const entry = byDirector.get(director) ?? { scores: [], movies: [] };
      if (score !== null) entry.scores.push(score);
      entry.movies.push({
        screeningId: screening.id,
        title: screening.movie.title,
        posterPath: screening.movie.posterPath,
        score,
      });
      byDirector.set(director, entry);
    }
  }
  return Array.from(byDirector.entries())
    .map(([director, { scores, movies }]) => ({
      director,
      frequency: movies.length,
      score: scores.length > 0 ? average(scores) : null,
      movies: [...movies].sort(
        (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
      ),
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

export type ScoreTrendPoint = {
  screeningId: string;
  date: Date;
  title: string;
  score: number;
};

export function computeScoreTrend(
  screenings: ScreeningStats[],
): ScoreTrendPoint[] {
  const points: ScoreTrendPoint[] = [];
  for (const screening of [...screenings].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  )) {
    if (!screening.movie) continue;
    const score = computeOfficialScore(screening);
    if (score === null) continue;
    points.push({
      screeningId: screening.id,
      date: screening.date,
      title: screening.movie.title,
      score,
    });
  }
  return points;
}

export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mär",
  "Apr",
  "Mai",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dez",
];

export type MonthlyPerformance = {
  month: number; // 1-12
  label: string;
  score: number | null;
  screeningCount: number;
  movies: RankedMovie[];
};

/** Durchschnittsscore je Kalendermonat, über alle Jahre hinweg aggregiert. */
export function computeMonthlyPerformance(
  screenings: ScreeningStats[],
): MonthlyPerformance[] {
  const byMonth = new Map<
    number,
    { scores: number[]; movies: RankedMovie[] }
  >();
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const month = screening.date.getMonth() + 1;
    const entry = byMonth.get(month) ?? { scores: [], movies: [] };
    const score = computeOfficialScore(screening);
    if (score !== null) entry.scores.push(score);
    entry.movies.push({
      screeningId: screening.id,
      title: screening.movie.title,
      posterPath: screening.movie.posterPath,
      score,
    });
    byMonth.set(month, entry);
  }
  return Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
    const entry = byMonth.get(month) ?? { scores: [], movies: [] };
    return {
      month,
      label: MONTH_LABELS[month - 1],
      score: entry.scores.length > 0 ? average(entry.scores) : null,
      screeningCount: entry.movies.length,
      movies: [...entry.movies].sort(
        (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
      ),
    };
  });
}

export type QuarterlyPerformance = {
  quarter: 1 | 2 | 3 | 4;
  score: number | null;
  screeningCount: number;
  movies: RankedMovie[];
};

/** Durchschnittsscore je Quartal (Q1 = Jan-Mär, ...), über alle Jahre hinweg aggregiert. */
export function computeQuarterlyPerformance(
  screenings: ScreeningStats[],
): QuarterlyPerformance[] {
  const byQuarter = new Map<
    number,
    { scores: number[]; movies: RankedMovie[] }
  >();
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const quarter = Math.floor(screening.date.getMonth() / 3) + 1;
    const entry = byQuarter.get(quarter) ?? { scores: [], movies: [] };
    const score = computeOfficialScore(screening);
    if (score !== null) entry.scores.push(score);
    entry.movies.push({
      screeningId: screening.id,
      title: screening.movie.title,
      posterPath: screening.movie.posterPath,
      score,
    });
    byQuarter.set(quarter, entry);
  }
  return [1, 2, 3, 4].map((quarter) => {
    const entry = byQuarter.get(quarter) ?? { scores: [], movies: [] };
    return {
      quarter: quarter as 1 | 2 | 3 | 4,
      score: entry.scores.length > 0 ? average(entry.scores) : null,
      screeningCount: entry.movies.length,
      movies: [...entry.movies].sort(
        (a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity),
      ),
    };
  });
}

export const GOOD_STREAK_THRESHOLD = 50;
export const BAD_STREAK_THRESHOLD = 0;

export type StreakMovie = {
  screeningId: string;
  title: string;
  date: Date;
  score: number;
};

export type Streak = {
  length: number;
  startDate: Date;
  endDate: Date;
  movies: StreakMovie[];
};

export type StreakStats = {
  bestGoodStreak: Streak | null;
  bestBadStreak: Streak | null;
};

/**
 * Längste Serie aufeinanderfolgender (chronologisch, nur ausgewertete)
 * Vorstellungen über GOOD_STREAK_THRESHOLD bzw. unter BAD_STREAK_THRESHOLD.
 * Vorstellungen ohne Kino-Wertung werden übersprungen, statt die Serie zu
 * unterbrechen (unbekannt != schlecht).
 */
export function computeStreaks(screenings: ScreeningStats[]): StreakStats {
  const scored: StreakMovie[] = [];
  for (const screening of [...screenings].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  )) {
    if (!screening.movie) continue;
    const score = computeOfficialScore(screening);
    if (score === null) continue;
    scored.push({
      screeningId: screening.id,
      title: screening.movie.title,
      date: screening.date,
      score,
    });
  }

  function longestStreak(predicate: (score: number) => boolean): Streak | null {
    let best: StreakMovie[] = [];
    let current: StreakMovie[] = [];
    for (const item of scored) {
      if (predicate(item.score)) {
        current = [...current, item];
        if (current.length > best.length) best = current;
      } else {
        current = [];
      }
    }
    if (best.length === 0) return null;
    return {
      length: best.length,
      startDate: best[0].date,
      endDate: best[best.length - 1].date,
      movies: best,
    };
  }

  return {
    bestGoodStreak: longestStreak((score) => score >= GOOD_STREAK_THRESHOLD),
    bestBadStreak: longestStreak((score) => score < BAD_STREAK_THRESHOLD),
  };
}

export type PolarizationEntry = {
  screeningId: string;
  title: string;
  posterPath: string | null;
  date: Date;
  score: number;
  sharpness: number; // gut% + hundsmiserabel% -> je höher, desto gespaltener
  gutPercent: number;
  soLalaPercent: number;
  hundsmiserabelPercent: number;
};

/**
 * "Meinungsschärfe": Anteil der Stimmen an den beiden Extremen (Gut +
 * Hundsmiserabel). Hoher Wert = polarisierend (wenig "So lala"), niedriger
 * Wert = breiter Konsens in der Mitte.
 */
export function computePolarization(
  screenings: ScreeningStats[],
): PolarizationEntry[] {
  const entries: PolarizationEntry[] = [];
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const {
      officialGutPercent: g,
      officialSoLalaPercent: s,
      officialHundsmiserabelPercent: h,
    } = screening;
    if (g == null || s == null || h == null) continue;
    const score = computeOfficialScore(screening);
    if (score === null) continue;
    entries.push({
      screeningId: screening.id,
      title: screening.movie.title,
      posterPath: screening.movie.posterPath,
      date: screening.date,
      score,
      sharpness: g + h,
      gutPercent: g,
      soLalaPercent: s,
      hundsmiserabelPercent: h,
    });
  }
  return entries.sort((a, b) => b.sharpness - a.sharpness);
}

export type TmdbComparisonEntry = {
  screeningId: string;
  title: string;
  posterPath: string | null;
  ourScore: number; // -100..+100
  ourScoreAsVote: number; // auf 0-10 umgerechnet, vergleichbar mit TMDB
  tmdbVoteAverage: number; // 0-10
  difference: number; // ourScoreAsVote - tmdbVoteAverage
};

/**
 * Vergleicht unsere Kino-Wertung mit dem TMDB-Publikumsschnitt. Unser Score
 * (-100..+100) wird linear auf die TMDB-Skala (0-10) abgebildet (0 -> 5.0,
 * +100 -> 10.0, -100 -> 0.0), damit beide Werte direkt vergleichbar sind.
 * Filme ohne TMDB-Stimmen (voteAverage 0 oder unbekannt) werden ausgelassen.
 */
export function computeTmdbComparison(
  screenings: ScreeningStats[],
): TmdbComparisonEntry[] {
  const entries: TmdbComparisonEntry[] = [];
  for (const screening of screenings) {
    if (!screening.movie) continue;
    const score = computeOfficialScore(screening);
    if (score === null) continue;
    const voteAverage = screening.movie.voteAverage;
    if (!voteAverage) continue;
    const ourScoreAsVote = (score / 100) * 5 + 5;
    entries.push({
      screeningId: screening.id,
      title: screening.movie.title,
      posterPath: screening.movie.posterPath,
      ourScore: score,
      ourScoreAsVote,
      tmdbVoteAverage: voteAverage,
      difference: ourScoreAsVote - voteAverage,
    });
  }
  return entries.sort((a, b) => b.difference - a.difference);
}
