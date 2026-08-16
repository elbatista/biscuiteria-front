import { Loader2 } from "lucide-react";

type LoadingScreenProps = {
  title?: string;
  description?: string;
  fullPage?: boolean;
  compact?: boolean;
};

export default function LoadingScreen({
  title = "Carregando...",
  description = "Aguarde um instante enquanto preparamos tudo.",
  fullPage = true,
  compact = false,
}: LoadingScreenProps) {
  const content = (
    <div
      className={[
        "mx-auto w-full max-w-xl rounded-[2rem] border border-[var(--rose-100)] bg-white/85 p-6 text-center shadow-sm backdrop-blur sm:p-8",
        compact ? "max-w-sm p-5 sm:p-6" : "",
      ].join(" ")}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--green-500)] ring-1 ring-[var(--rose-100)]">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--green-500)]">
        Biscuit_eria
      </p>

      <h1
        className={[
          "mt-2 font-playfair font-semibold tracking-tight text-zinc-900",
          compact ? "text-2xl" : "text-3xl sm:text-4xl",
        ].join(" ")}
      >
        {title}
      </h1>

      {description ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}

      <div className="mt-6 space-y-3">
        <div className="mx-auto h-3 w-3/4 animate-pulse rounded-full bg-[var(--rose-100)]" />
        <div className="mx-auto h-3 w-1/2 animate-pulse rounded-full bg-[var(--rose-100)]" />
      </div>
    </div>
  );

  if (!fullPage) {
    return content;
  }

  return (
    <main className="min-h-screen bg-[var(--rose-50)] text-[var(--text-main)]">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        {content}
      </div>
    </main>
  );
}