"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { upsertMovieFromTmdb } from "@/lib/movies";
import { screeningTypeTime } from "@/lib/labels";
import type { ScreeningType } from "@/generated/prisma/client";

const schema = z.object({
  date: z.string().min(1, "Datum ist erforderlich"),
  type: z.enum(["SNEAK_PREVIEW", "BLOODY_FRIDAY"]),
  notes: z.string().optional(),
  tmdbId: z.string().optional(),
  officialGutPercent: z.string().optional(),
  officialSoLalaPercent: z.string().optional(),
  officialHundsmiserabelPercent: z.string().optional(),
});

function parsePercent(raw: string | undefined): number | null {
  if (!raw || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > 100) {
    throw new Error("Kino-Wertung muss eine Zahl zwischen 0 und 100 sein");
  }
  return n;
}

function combineDateWithScreeningTime(dateOnly: string, type: ScreeningType): Date {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const { hours, minutes } = screeningTypeTime[type];
  return new Date(year, month - 1, day, hours, minutes);
}

export type ScreeningFormState = { error?: string };

async function buildScreeningData(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ungültige Eingabe");
  }
  const {
    date,
    type,
    notes,
    tmdbId,
    officialGutPercent,
    officialSoLalaPercent,
    officialHundsmiserabelPercent,
  } = parsed.data;

  let movieId: string | undefined;
  if (tmdbId) {
    const movie = await upsertMovieFromTmdb(Number(tmdbId));
    movieId = movie.id;
  }

  const gut = parsePercent(officialGutPercent);
  const soLala = parsePercent(officialSoLalaPercent);
  const hundsmiserabel = parsePercent(officialHundsmiserabelPercent);
  const officialValues = [gut, soLala, hundsmiserabel];
  if (officialValues.some((v) => v !== null) && officialValues.some((v) => v === null)) {
    throw new Error("Bitte alle drei Kino-Werte eintragen");
  }

  return {
    date: combineDateWithScreeningTime(date, type),
    type: type as ScreeningType,
    notes: notes || null,
    movieId,
    officialGutPercent: gut,
    officialSoLalaPercent: soLala,
    officialHundsmiserabelPercent: hundsmiserabel,
  };
}

export async function createScreening(
  _prevState: ScreeningFormState,
  formData: FormData,
): Promise<ScreeningFormState> {
  const session = await requireAdmin();
  try {
    const data = await buildScreeningData(formData);
    await prisma.screening.create({
      data: { ...data, createdById: session.user.id },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Fehler beim Erstellen" };
  }
  revalidatePath("/admin/screenings");
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/admin/screenings");
}

export async function updateScreening(
  screeningId: string,
  _prevState: ScreeningFormState,
  formData: FormData,
): Promise<ScreeningFormState> {
  await requireAdmin();
  try {
    const data = await buildScreeningData(formData);
    await prisma.screening.update({ where: { id: screeningId }, data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Fehler beim Speichern" };
  }
  revalidatePath("/admin/screenings");
  revalidatePath(`/screenings/${screeningId}`);
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect("/admin/screenings");
}

export async function deleteScreening(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.screening.delete({ where: { id } });
  revalidatePath("/admin/screenings");
  revalidatePath("/");
}
