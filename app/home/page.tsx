// app/page.tsx
// Next.js (App Router) + TailwindCSS
// Home page (pt-BR), cores suaves (rosé + verde água) e tipografia elegante via classes.
// Observação: para fontes elegantes, recomendo configurar no layout com next/font (Playfair Display + Inter).
// Aqui deixei classes prontas (font-serif / font-sans) para você plugar no tailwind depois.

import Link from "next/link";
import Image from "next/image";
import { CreditCard, Truck, MessageCircle } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: string;
  href: string;
  badge?: string;
  image: string;
};

const PRODUCTS: Product[] = [
  { id: "1", name: "Enfeite de Natal – Presépio", price: "R$ 14,90", href: "/loja/presepio", badge: "Mais vendido", image: "/fotos/1.jpeg" },
  { id: "2", name: "Enfeite de Porta – Guirlanda", price: "R$ 29,90", href: "/loja/guirlanda", image: "/fotos/2.jpeg" },
  { id: "3", name: "Lembrancinha – Anjinho", price: "R$ 9,90", href: "/loja/anjinho", image: "/fotos/3.jpeg" },
  { id: "4", name: "Topo de Bolo Personalizado", price: "R$ 79,90", href: "/encomendas", badge: "Personalizado", image: "/fotos/4.jpeg" },
  { id: "5", name: "Mini Enfeite – Coração", price: "R$ 11,90", href: "/loja/coracao", image: "/fotos/9.jpeg" },
  { id: "6", name: "Enfeite – Plaquinha Decor", price: "R$ 19,90", href: "/loja/plaquinha", image: "/fotos/6.jpeg" },
  { id: "7", name: "Kit Festa – Tema Jardim", price: "R$ 149,90", href: "/encomendas", badge: "Sob encomenda", image: "/fotos/7.jpeg" },
  { id: "8", name: "Enfeite de Mesa – Flores", price: "R$ 39,90", href: "/loja/flores", image: "/fotos/8.jpeg" },
];

const TESTIMONIALS = [
  {
    name: "Mariana S.",
    text: "Chegou perfeito! Muito capricho e embalado com carinho. Vou comprar mais!",
  },
  {
    name: "Renata P.",
    text: "A personalização ficou idêntica ao que pedi. Atendimento rápido e super atencioso.",
  },
  {
    name: "Carlos M.",
    text: "Detalhes incríveis. Dá pra ver que é feito à mão com cuidado.",
  },
];

const FEATURES = [
  { title: "100% artesanal", desc: "Peças feitas à mão, uma a uma.", icon: "🖐️" },
  { title: "Sob encomenda", desc: "Personalizamos do seu jeito.", icon: "🎨" },
  { title: "Presente perfeito", desc: "Para datas especiais e lembranças.", icon: "🎁" },
  { title: "Feito no Brasil", desc: "Produção local com carinho.", icon: "🇧🇷" },
];

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

function Nav() {
  const items = [
    { label: "Início", href: "/" },
    { label: "Loja", href: "/loja" },
    { label: "Encomendas Personalizadas", href: "/encomendas" },
    { label: "Sobre", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100/70 bg-white/80 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-200 to-emerald-100 ring-1 ring-rose-200/60">
              <Image src="/logo.jpg" alt="Biscuit_eria" width={40} height={40} className="rounded-xl object-cover w-full h-full" />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-3xl tracking-tight text-zinc-900">Biscuit_eria</div>
              {/* <div className="text-xs text-zinc-500">artesanato em biscuit</div> */}
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="hover:text-zinc-900 transition-colors"
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/loja"
              className="hidden rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 md:inline-flex"
            >
              Comprar
            </Link>
            <Link
              href="/encomendas"
              className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:border-rose-300 hover:bg-rose-50/50"
            >
              Encomendar
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-rose-100/60 blur-3xl" />
        <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <Container>
        <div className="grid items-center gap-10 py-12 md:grid-cols-2 md:py-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Feito à mão • Peças exclusivas
            </p>

            <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Aqui você encontra tudo para o seu <span className="text-rose-600">chimarrão</span> 🧉
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600">
              Enfeites personalizados, cuias e acessórios para decorar, presentear e encantar.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/loja"
                className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
              >
                Comprar agora
              </Link>
              <Link
                href="/encomendas"
                className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-rose-50/50 hover:border-rose-300"
              >
                Fazer encomenda personalizada
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs text-zinc-600">
              <span className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                <CreditCard size={14} />
                Pix / Cartão
              </span>

              <span className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                <Truck size={14} />
                Envio para todo Brasil
              </span>

              <span className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 shadow-sm">
                <MessageCircle size={14} />
                Atendimento via WhatsApp
              </span>
            </div>

          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
              {/* Substitua por next/image com sua foto real */}
              
              <Image
                    className="object-cover w-full h-full"
                    src="/fotos/5.jpeg"
                    alt="Foto de destaque mostrando peças em biscuit"
                    width={400}
                    height={300}
                  />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="rounded-2xl bg-white/80 p-4 backdrop-blur shadow-sm ring-1 ring-rose-100">
                  
                  <div className="font-serif text-xl text-zinc-900">Detalhes que encantam</div>
                  {/* <div className="mt-1 text-sm text-zinc-600">
                    Fotos de produtos reais feitos à mão com muito carinho e atenção aos detalhes.
                  </div> */}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-3xl bg-rose-200/60 blur-xl" />
          </div>
        </div>
      </Container>
    </section>
  );
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
    <div className="mb-7">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wider text-rose-600">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-serif text-3xl tracking-tight text-zinc-900 sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">{subtitle}</p> : null}
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  return (
    <div className="group rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative overflow-hidden rounded-t-3xl">
        {/* placeholder image */}
        {/* <div className="aspect-square w-full bg-gradient-to-br from-rose-100 via-white to-emerald-100" /> */}
        <Image
                    className="object-cover w-full h-68"
                    src={p.image}
                    alt="Foto de destaque mostrando peças em biscuit"
                    width={400}
                    height={300}
                  />
        {p.badge ? (
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm ring-1 ring-rose-100">
            {p.badge}
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-lg tracking-tight text-zinc-900">{p.name}</h3>
          <div className="text-sm font-semibold text-zinc-900">{p.price}</div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Link
            href={p.href}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Comprar
          </Link>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-rose-50/50 hover:border-rose-300"
          >
            Dúvida
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturedProducts() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <SectionTitle
          eyebrow="Destaques"
          title="Mais vendidos"
          subtitle="Escolha uma peça pronta entrega ou garanta sua encomenda com antecedência."
        />

        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        <div className="mt-8">
          <Link
            href="/loja"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50"
          >
            Ver todos os produtos
          </Link>
        </div>
      </Container>
    </section>
  );
}

function WhyBuy() {
  return (
    <section className="border-y border-rose-100/70 bg-rose-50/30 py-12 md:py-16">
      <Container>
        <SectionTitle
          // eyebrow="Confiança"
          title="Por que comprar da Biscuit_eria?"
          subtitle="Artesanato com padrão de qualidade e um processo simples para você comprar com tranquilidade."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-rose-100 bg-white p-5 shadow-sm"
            >
              <div className="text-3xl sm:text-5xl">{f.icon}</div>
              <div className="mt-3 font-serif text-lg text-zinc-900">{f.title}</div>
              <div className="mt-1 text-sm leading-relaxed text-zinc-600">{f.desc}</div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-12 md:py-16">
      <Container>
        <SectionTitle
          // eyebrow="Prova social"
          title="Clientes que amaram"
          // subtitle="Depoimentos reais + espaço para você inserir prints (WhatsApp/Elo7) e fotos de pedidos entregues."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: image grid placeholders */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-rose-100 via-white to-emerald-100 shadow-sm">
              <div className="p-4 text-sm text-zinc-700">
                <div className="font-semibold text-zinc-900">Foto de pedido entregue</div>
                <div className="mt-1 text-zinc-600">Substituir por foto real.</div>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-100 via-white to-rose-100 shadow-sm">
              <div className="p-4 text-sm text-zinc-700">
                <div className="font-semibold text-zinc-900">Print de mensagem</div>
                <div className="mt-1 text-zinc-600">Substituir por print real.</div>
              </div>
            </div>
            <div className="sm:col-span-2 rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="p-5">
                <div className="font-semibold text-zinc-900">Dica de conversão</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  Use 3–6 provas sociais bem visíveis: 2 fotos de pedidos + 2 prints + 2 depoimentos curtos.
                </p>
              </div>
            </div>
          </div>

          {/* Right: testimonials */}
          <div className="grid gap-5">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-rose-100 bg-rose-50/30 p-5 shadow-sm"
              >
                <p className="text-sm leading-relaxed text-zinc-700">“{t.text}”</p>
                <div className="mt-3 text-sm font-semibold text-zinc-900">{t.name}</div>
              </div>
            ))}

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="font-serif text-lg text-zinc-900">Quer ver seu pedido aqui?</div>
              <p className="mt-1 text-sm text-zinc-600">
                Envie sua foto e depoimento após receber. 💗
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contato"
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Falar no WhatsApp
                </Link>
                <Link
                  href="/loja"
                  className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-rose-50/50 hover:border-rose-300"
                >
                  Comprar agora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-rose-100/70 py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-140px] top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-rose-100/60 blur-3xl" />
        <div className="absolute right-[-140px] top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <Container>
        <div className="rounded-3xl border border-rose-100 bg-white/80 p-7 shadow-sm backdrop-blur sm:p-10">
          <h2 className="font-serif text-3xl tracking-tight text-zinc-900 sm:text-4xl">
            Encontre o presente perfeito em biscuit
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Explore os produtos mais queridos ou peça uma peça personalizada com o tema, cor e detalhes que você quiser.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/loja"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Ver todos os produtos
            </Link>
            <Link
              href="/encomendas"
              className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-rose-50/50 hover:border-rose-300"
            >
              Fazer encomenda personalizada
            </Link>
          </div>
        </div>

        <footer className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-zinc-200/70 pt-6 text-sm text-zinc-600 sm:flex-row sm:items-center">
          <div>
            <div className="font-serif text-base text-zinc-900">Biscuit_eria</div>
            <div className="mt-1 text-xs text-zinc-500">© {new Date().getFullYear()} • Artesanato em biscuit</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/contato" className="hover:text-zinc-900">Contato</Link>
            <Link href="/sobre" className="hover:text-zinc-900">Sobre</Link>
            <Link href="/politica-de-privacidade" className="hover:text-zinc-900">Privacidade</Link>
          </div>
        </footer>
      </Container>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Nav />
      <Hero />
      <FeaturedProducts />
      <WhyBuy />
      <SocialProof />
      <FinalCTA />
    </main>
  );
}
