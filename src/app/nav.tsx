import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Nav() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold text-zinc-950 dark:text-zinc-50">
          🎬 Sneak-Tracker
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {session && (
            <Link
              href="/dashboard"
              className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Statistik
            </Link>
          )}
          {session?.user.role === "ADMIN" && (
            <Link
              href="/admin/screenings"
              className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Admin
            </Link>
          )}
          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50">
                Abmelden ({session.user.name})
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Anmelden
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
