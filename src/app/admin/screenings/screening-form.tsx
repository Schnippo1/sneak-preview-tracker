"use client";

import { useActionState } from "react";
import { MovieSearch } from "./movie-search";
import type { ScreeningFormState } from "./actions";
import { ratingValueLabels, ratingValueOrder } from "@/lib/labels";
import type { ScreeningType } from "@/generated/prisma/client";

type DefaultValues = {
  date: string;
  type: ScreeningType;
  notes: string;
  officialGutPercent: string;
  officialSoLalaPercent: string;
  officialHundsmiserabelPercent: string;
  movie: { tmdbId: number; title: string; posterPath: string | null } | null;
};

type OfficialPercentKey =
  | "officialGutPercent"
  | "officialSoLalaPercent"
  | "officialHundsmiserabelPercent";

const OFFICIAL_PERCENT_FIELDS: Record<
  "GUT" | "SO_LALA" | "HUNDSMISERABEL",
  { name: OfficialPercentKey; key: OfficialPercentKey }
> = {
  GUT: { name: "officialGutPercent", key: "officialGutPercent" },
  SO_LALA: { name: "officialSoLalaPercent", key: "officialSoLalaPercent" },
  HUNDSMISERABEL: { name: "officialHundsmiserabelPercent", key: "officialHundsmiserabelPercent" },
};

export function ScreeningForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ScreeningFormState, formData: FormData) => Promise<ScreeningFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <MovieSearch defaultMovie={defaultValues?.movie ?? null} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Typ</span>
        <select
          name="type"
          defaultValue={defaultValues?.type ?? "SNEAK_PREVIEW"}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="SNEAK_PREVIEW">Sneak Preview (immer Mittwochs, 21:30)</option>
          <option value="BLOODY_FRIDAY">Bloody Friday (immer Freitags, 23:15)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Datum</span>
        <input
          type="date"
          name="date"
          required
          defaultValue={defaultValues?.date}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Die Uhrzeit wird automatisch aus dem Typ übernommen.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Notizen</span>
        <textarea
          name="notes"
          defaultValue={defaultValues?.notes}
          rows={2}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>

      <fieldset className="flex flex-col gap-2 text-sm">
        <legend className="font-medium text-zinc-700 dark:text-zinc-300">
          Offizielle Kino-Wertung (%)
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {ratingValueOrder.map((value) => {
            const field = OFFICIAL_PERCENT_FIELDS[value];
            return (
              <label key={value} className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {ratingValueLabels[value]}
                </span>
                <input
                  type="number"
                  name={field.name}
                  min={0}
                  max={100}
                  defaultValue={defaultValues?.[field.key]}
                  placeholder="z. B. 50"
                  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </label>
            );
          })}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Wird meist erst rund eine Woche später vom Kino veröffentlicht. Leer lassen, bis
          bekannt.
        </span>
      </fieldset>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {pending ? "Wird gespeichert…" : submitLabel}
      </button>
    </form>
  );
}
