import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") throw new Error("Forbidden");
  return session;
}
