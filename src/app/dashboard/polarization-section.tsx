import Link from "next/link";
import type { PolarizationEntry } from "@/lib/stats";

const PREVIEW_COUNT = 5;

function SplitBar({
  gut,
  soLala,
  hundsmiserabel,
}: {
  gut: number;
  soLala: number;
  hundsmiserabel: number;
}) {
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
      <div
        style={{ width: `${gut}%`, background: "var(--chart-series-good)" }}
      />
      <div
        style={{ width: `${soLala}%`, background: "var(--chart-series-meh)" }}
      />
      <div
        style={{
          width: `${hundsmiserabel}%`,
          background: "var(--chart-series-bad)",
        }}
      />
    </div>
  );
}

function PolarizationList({
  title,
  description,
  entries,
}: {
  title: string;
  description: string;
  entries: PolarizationEntry[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Noch keine ausgewerteten Vorstellungen.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {entries.slice(0, PREVIEW_COUNT).map((entry) => (
            <li key={entry.screeningId}>
              <Link href={`/screenings/${entry.screeningId}`} className="block">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-950 dark:text-zinc-50">
                    {entry.title}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {entry.gutPercent}/{entry.soLalaPercent}/
                    {entry.hundsmiserabelPercent}
                  </span>
                </div>
                <div className="mt-1">
                  <SplitBar
                    gut={entry.gutPercent}
                    soLala={entry.soLalaPercent}
                    hundsmiserabel={entry.hundsmiserabelPercent}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PolarizationSection({ data }: { data: PolarizationEntry[] }) {
  const mostPolarizing = data;
  const mostConsensus = [...data].reverse();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <PolarizationList
        title="Am meisten gespalten"
        description="Wenig 'So lala', viele Extremstimmen."
        entries={mostPolarizing}
      />
      <PolarizationList
        title="Größte Einigkeit"
        description="Viel 'So lala', kaum Extremstimmen."
        entries={mostConsensus}
      />
    </div>
  );
}
