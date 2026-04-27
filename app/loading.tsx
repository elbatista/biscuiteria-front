export default function RootLoading() {
  return (
    <main className="min-h-screen bg-[var(--rose-50)] text-[var(--text-main)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-8 space-y-3">
          <div className="h-5 w-24 animate-pulse rounded-full bg-[var(--rose-100)]" />
          <div className="h-9 w-64 animate-pulse rounded-full bg-[var(--rose-100)]" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded-full bg-[var(--rose-100)]" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-[var(--rose-100)] bg-white/70 shadow-sm"
            >
              <div className="aspect-[4/3] animate-pulse bg-[var(--rose-100)]" />

              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-[var(--rose-100)]" />
                <div className="h-4 w-full animate-pulse rounded-full bg-[var(--rose-100)]" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-[var(--rose-100)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}