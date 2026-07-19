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

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
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
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
