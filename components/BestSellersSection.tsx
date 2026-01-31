"use client";

import Image from "next/image";
import Link from "next/link";

type BestSeller = {
  name: string;
  price: number;
  slug: string;
  image: string;
  badge?: string;
};

const bestSellers: BestSeller[] = [
  {
    name: "Cuia personalizada (nome)",
    price: 79.9,
    slug: "cuia-personalizada-nome",
    image: "/fotos/1.jpeg",
    badge: "Top 1",
  },
  {
    name: "Kit chimarrão completo",
    price: 129.9,
    slug: "kit-chimarrao-completo",
    image: "/fotos/2.jpeg",
    badge: "Mais pedido",
  },
  {
    name: "Porta-erva decorado",
    price: 59.9,
    slug: "porta-erva-decorado",
    image: "/fotos/3.jpeg",
    badge: "Presente",
  },
  {
    name: "Enfeite de cuia (tema time)",
    price: 49.9,
    slug: "enfeite-cuia-tema-time",
    image: "/fotos/6.jpeg",
    badge: "Personalizado",
  },
  {
    name: "Mini enfeite – coração",
    price: 11.9,
    slug: "mini-enfeite-coracao",
    image: "/fotos/9.jpeg",
  },
  {
    name: "Enfeite – plaquinha decor",
    price: 19.9,
    slug: "enfeite-plaquinha-decor",
    image: "/fotos/4.jpeg",
  },
  {
    name: "Kit festa – tema jardim",
    price: 149.9,
    slug: "kit-festa-tema-jardim",
    image: "/fotos/7.jpeg",
    badge: "Sob encomenda",
  },
  {
    name: "Enfeite de mesa – flores",
    price: 39.9,
    slug: "enfeite-de-mesa-flores",
    image: "/fotos/8.jpeg",
  },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function addToCart(item: BestSeller) {
  const key = "biscuit_cart";
  const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;

  const cart: Array<BestSeller & { qty: number }> = raw ? JSON.parse(raw) : [];
  const idx = cart.findIndex((x) => x.slug === item.slug);

  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ ...item, qty: 1 });

  localStorage.setItem(key, JSON.stringify(cart));

  // opcional: notificar header/badge se você criar depois
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));

  // placeholder simples (você pode trocar por toast)
  alert(`Adicionado ao carrinho: ${item.name}`);
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>;
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-3">
      {eyebrow ? (
        <span className="inline-flex items-center rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-medium text-[var(--rose-500)]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-playfair text-2xl font-semibold tracking-tight sm:text-3xl text-zinc-900">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
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
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition";
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

export default function BestSellersSection() {
  return (
    <section className="bg-white py-14 sm:py-16 border-y border-[var(--rose-100)]/70">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Favoritos da loja"
              title="Mais vendidos"
              subtitle="Os queridinhos que mais saem — perfeitos para presentear ou deixar seu chimarrão ainda mais especial."
            />

            <div className="flex gap-3">
              <Button href="/loja" variant="secondary">
                Ver tudo
              </Button>
              <Button href="/carrinho">Ir ao carrinho</Button>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <div
                key={p.slug}
                className="rounded-3xl border border-[var(--rose-100)] bg-white shadow-sm hover:shadow-md transition overflow-hidden"
              >
                <Link href={`/loja/${p.slug}`} className="group block">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={p.image}
                      alt={`Foto do produto ${p.name}`}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {p.badge ? (
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-medium text-[var(--rose-500)] border border-[var(--rose-300)]">
                          {p.badge}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-5">
                    <div className="text-sm font-semibold text-zinc-900 line-clamp-2">
                      {p.name}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--green-500)]">
                      {formatBRL(p.price)}
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="px-5 pb-5">
                  <div className="grid gap-2">
                    {/* Comprar: leva pro produto com intenção de compra */}
                    <Link
                      href={`/loja/${p.slug}?buy=1`}
                      className="inline-flex gap-3 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition bg-[var(--green-500)] text-white hover:bg-[var(--green-300)] shadow-sm"
                    >
                      Comprar <span className="text-2xl">📦</span>
                    </Link>

                    {/* Add carrinho: localStorage */}
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      className="cursor-pointer inline-flex gap-3 items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition bg-[var(--rose-100)] text-[var(--rose-500)] hover:bg-[var(--rose-300)] border border-[var(--rose-300)]"
                    >
                      Adicionar ao carrinho 
                      <span className="text-2xl">🛒</span>
                    </button>
                  </div>

                  <div className="mt-3 text-xs text-[var(--text-muted)]">
                    Ou veja detalhes em{" "}
                    <Link
                      href={`/loja/${p.slug}`}
                      className="font-semibold text-[var(--green-500)] hover:underline"
                    >
                      /loja/{p.slug}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              Quer algo único? Faça uma encomenda do seu jeito.
            </p>
            <Button href="/personalizados">Fazer encomenda personalizada</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
