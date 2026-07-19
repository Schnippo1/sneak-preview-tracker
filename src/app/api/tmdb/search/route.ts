import { auth } from "@/auth";
import { searchTmdbMovies } from "@/lib/tmdb";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  if (!query.trim()) return Response.json([]);

  const results = await searchTmdbMovies(query);
  return Response.json(results);
}
