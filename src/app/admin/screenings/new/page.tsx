import { ScreeningForm } from "../screening-form";
import { createScreening } from "../actions";

export default function NewScreeningPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">
        Neue Vorstellung
      </h1>
      <ScreeningForm action={createScreening} submitLabel="Erstellen" />
    </main>
  );
}
