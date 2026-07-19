const TMDB_BASE = "https://api.themoviedb.org/3";

export type TmdbSearchResult = {
  tmdbId: number;
  title: string;
  originalTitle: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number;
};

export type TmdbMovieDetails = {
  tmdbId: number;
  title: string;
  originalTitle: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: Date | null;
  runtimeMin: number | null;
  genres: string[];
  directors: string[];
  voteAverage: number;
};

function tmdbUrl(path: string, params: Record<string, string>) {
  const url = new URL(`${TMDB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY ?? "");
  url.searchParams.set("language", "de-DE");
  return url;
}

export async function searchTmdbMovies(query: string): Promise<TmdbSearchResult[]> {
  const res = await fetch(tmdbUrl("/search/movie", { query }));
  if (!res.ok) throw new Error("TMDB-Suche fehlgeschlagen");
  const data = await res.json();
  return data.results.map(
    (r: {
      id: number;
      title: string;
      original_title: string;
      poster_path: string | null;
      release_date: string | null;
      vote_average: number;
    }) => ({
      tmdbId: r.id,
      title: r.title,
      originalTitle: r.original_title,
      posterPath: r.poster_path,
      releaseDate: r.release_date,
      voteAverage: r.vote_average,
    }),
  );
}

export async function getTmdbMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
  const res = await fetch(
    tmdbUrl(`/movie/${tmdbId}`, { append_to_response: "credits" }),
  );
  if (!res.ok) throw new Error("TMDB-Details fehlgeschlagen");
  const data = await res.json();
  return {
    tmdbId: data.id,
    title: data.title,
    originalTitle: data.original_title,
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    overview: data.overview ?? "",
    releaseDate: data.release_date ? new Date(data.release_date) : null,
    runtimeMin: data.runtime ?? null,
    genres: (data.genres ?? []).map((g: { name: string }) => g.name),
    directors: (data.credits?.crew ?? [])
      .filter((c: { job: string }) => c.job === "Director")
      .map((c: { name: string }) => c.name),
    voteAverage: data.vote_average,
  };
}
