import type { ScreeningType } from "@/generated/prisma/client";

export const RATING_VALUES = ["GUT", "SO_LALA", "HUNDSMISERABEL"] as const;
export type RatingValue = (typeof RATING_VALUES)[number];

export const screeningTypeLabels: Record<ScreeningType, string> = {
  SNEAK_PREVIEW: "Sneak Preview",
  BLOODY_FRIDAY: "Bloody Friday",
};

export const ratingValueLabels: Record<RatingValue, string> = {
  GUT: "Gut",
  SO_LALA: "So lala",
  HUNDSMISERABEL: "Hundsmiserabel",
};

export const ratingValueOrder: RatingValue[] = [...RATING_VALUES];

export const screeningTypeTime: Record<ScreeningType, { hours: number; minutes: number }> = {
  SNEAK_PREVIEW: { hours: 21, minutes: 30 },
  BLOODY_FRIDAY: { hours: 23, minutes: 15 },
};

/**
 * Screening-Zeiten sind immer als deutsche Uhrzeit gemeint (21:30 / 23:15
 * Europe/Berlin), unabhängig davon, in welcher Zeitzone der Server läuft
 * (lokal meist Europe/Berlin, auf Vercel UTC). Deshalb werden Datum/Uhrzeit
 * beim Speichern und Anzeigen explizit über diese Zeitzone gerechnet statt
 * über die Server-Systemzeit.
 */
export const GERMAN_TIME_ZONE = "Europe/Berlin";

/** Wandelt eine deutsche Wanduhrzeit (z. B. 15.07.2026, 21:30 Berlin) in den korrekten UTC-Zeitpunkt um, DST-sicher. */
export function germanWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hours, minutes);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: GERMAN_TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(utcGuess)
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  const berlinReadingOfGuessAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offsetMs = berlinReadingOfGuessAsUtc - utcGuess;
  return new Date(utcGuess - offsetMs);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: GERMAN_TIME_ZONE,
  }).format(date);
}

export function formatScore(score: number | null): string {
  if (score === null) return "–";
  const rounded = Math.round(score * 10) / 10;
  const formatted = new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(rounded));
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return formatted;
}

export function toDateInputValue(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: GERMAN_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  return `${parts.year}-${parts.month}-${parts.day}`;
}
