import Link from "next/link";

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl px-4">{children}</div>;
}

function Button({
  children,
  href,
  variant = "primary",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition";

  const styles =
    variant === "primary"
      ? "bg-[var(--green-500)] text-white hover:bg-[var(--green-300)] shadow-sm"
      : "bg-[var(--rose-100)] text-[var(--rose-500)] hover:bg-[var(--rose-300)] border border-[var(--rose-300)]";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--rose-50)] flex items-center">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-[var(--rose-100)] px-4 py-1 text-xs font-medium text-[var(--rose-500)]">
              Página não encontrada
            </span>

            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
              Opa… essa página não existe.
            </h1>

            <p className="max-w-md text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
              Parece que você chegou a um cantinho que ainda não foi moldado.
              Mas não se preocupe — tem muita coisa bonita esperando por você.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/">Voltar para o início</Button>
              {/* <Button href="/loja" variant="secondary">
                Ver a loja
              </Button> */}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] border border-[var(--rose-100)] bg-white shadow-sm">
              <div className="h-full w-full bg-gradient-to-br from-[var(--rose-100)] via-white to-[var(--green-50)]" />

              <div className="absolute inset-0 grid place-items-center text-center p-8">
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-3xl bg-[var(--green-500)] text-white grid place-items-center font-playfair text-xl shadow-sm">
                    404
                  </div>
                  <p className="text-sm font-semibold text-zinc-900">
                    Nada por aqui… ainda 💭
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Que tal explorar outras peças?
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-40 w-40 rounded-[2.75rem] border border-[var(--rose-100)] bg-white/70 shadow-sm backdrop-blur lg:block" />
            <div className="pointer-events-none absolute -top-6 -right-6 hidden h-28 w-28 rounded-[2.25rem] border border-[var(--rose-100)] bg-white/70 shadow-sm backdrop-blur lg:block" />
          </div>
        </div>
      </Container>
    </div>
  );
}
