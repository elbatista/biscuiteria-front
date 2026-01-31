import BestSellersSection from "@/components/BestSellersSection";
import Image from "next/image";
import Link from "next/link";

type NavItem = { label: string; href: string };

const nav: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Loja", href: "/loja" },
  { label: "Personalizados", href: "/personalizados" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4">{children}</div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--rose-100)] px-3 py-1 text-xs font-medium text-[var(--rose-500)]">
      {children}
    </span>
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
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--rose-50)] text-[var(--text-main)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--rose-100)] bg-[var(--rose-50)]/80 backdrop-blur">
        <Container>
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/icon.png"
                  width={64}
                  height={64}
                  alt="Biscuit_eria logo"
                />
              <div className="leading-tight">
                <div className="font-playfair text-2xl font-semibold text-zinc-900">
                  Biscuit_eria
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 md:flex">
              <Button href="/loja" variant="secondary">
                Descobrir peças
              </Button>
              <Button href="/personalizados">Criar algo só meu</Button>
            </div>

            <div className="md:hidden">
              <Button href="/loja" variant="primary">
                Loja
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--rose-50)] via-white to-white" />
          <Container>
            <div className="relative grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Artesanal</Badge>
                  <Badge>Encomendas personalizadas</Badge>
                  <Badge>Peças prontas para envio</Badge>
                </div>

                <h1 className="font-playfair text-4xl font-semibold tracking-tight sm:text-5xl text-[var(--green-500)]">
                  Aqui você encontra tudo para o seu chimarrão 🧉
                </h1>

                <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                  Enfeites personalizados, cuias e acessórios para decorar, presentear e encantar.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button href="/loja">Descobrir as peças</Button>
                  <Button href="/personalizados" variant="secondary">
                    Criar algo só meu
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-4 shadow-sm">
                    <div className="text-xs text-[var(--text-muted)]">
                      Prazo médio
                    </div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      sob consulta 📦
                    </div>
                  </div>
                  <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-4 shadow-sm">
                    <div className="text-xs text-[var(--text-muted)]">
                      Personalização
                    </div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      do seu jeito 🎨
                    </div>
                  </div>
                  <div className="hidden rounded-3xl border border-[var(--rose-100)] bg-white p-4 shadow-sm sm:block">
                    <div className="text-xs text-[var(--text-muted)]">
                      Envio para
                    </div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      todo Brasil 🇧🇷
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual placeholder */}
              <div className="relative">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[var(--rose-100)] bg-white shadow-sm">
                  <div className="h-full w-full bg-gradient-to-br from-[var(--rose-100)] via-white to-[var(--green-50)]" />
                  <div className="absolute inset-0 grid place-items-center text-center">
                    {/* <div className="space-y-3"> */}
                      {/* <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--green-500)] shadow-sm" />
                      <p className="text-sm font-semibold text-zinc-900">
                        Troque este bloco por uma foto lifestyle
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Ex.: peça na estante, presente entregue, detalhe em casa
                      </p> */}
                      <Image
                        className="object-cover overflow-hidden rounded-[2rem]"
                        src="/fotos/5.jpeg"
                        alt="Foto de destaque mostrando peças em biscuit"
                        width={600}
                        height={700}
                      />
                    {/* </div> */}
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-40 w-40 rounded-[2.5rem] border border-[var(--rose-100)] bg-white/70 shadow-sm backdrop-blur lg:block" />
                <div className="pointer-events-none absolute -top-6 -right-6 hidden h-28 w-28 rounded-[2.2rem] border border-[var(--rose-100)] bg-white/70 shadow-sm backdrop-blur lg:block" />
              </div>
            </div>
          </Container>
        </section>

        {/* MAIS VENDIDOS */}
        <BestSellersSection/>


        {/* IDENTIFICAÇÃO */}
        <section className="bg-white py-14 sm:py-20 border-y border-[var(--rose-100)]/70">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <SectionTitle
                eyebrow="Encontre seu motivo"
                title="Você vai amar se…"
                subtitle="A ideia aqui não é comprar qualquer coisa. É escolher uma peça que diga algo — por você ou por alguém."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Presentes que ninguém esquece",
                    desc: "Peças que carregam intenção e viram memória.",
                    icon: "🎁",
                  },
                  {
                    title: "Seu chimarrão personalizado",
                    desc: "Detalhes que aperfeiçoam seu chimarrão e contam história.",
                    icon: "🧉",
                  },
                  {
                    title: "Feito à mão, sem pressa",
                    desc: "Cada peça começa do zero.",
                    icon: "🖐️",
                  },
                  {
                    title: "Seu jeito, sua ideia",
                    desc: "Personalização para transformar referência em peça real.",
                    icon: "🎨",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="text-3xl sm:text-5xl">{card.icon}</div>
                    <div className="mt-3 text-sm font-semibold text-zinc-900">
                      {card.title}
                    </div>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                      {card.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="mt-10">
              <Button href="/loja" variant="secondary">
                Ver opções para mim
              </Button>
            </div> */}
          </Container>
        </section>

        {/* COLEÇÕES */}
        <section className="bg-[var(--green-50)] py-14 sm:py-20 border-y border-[var(--green-100)]">
          <Container>
            <div className="flex flex-col gap-8">
              <SectionTitle
                eyebrow="Curadoria"
                title="Coleções para escolher com facilidade"
                subtitle="Produtos separados por intenção: presente, chimas, infantil e momentos especiais."
              />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: "Presentes com significado",
                    desc: "Para emocionar de verdade.",
                    href: "/loja?colecao=presentes",
                    tag: "✨",
                  },
                  {
                    title: "Infantil & Afeto",
                    desc: "Delicado, lúdico e carinhoso.",
                    href: "/loja?colecao=infantil",
                    tag: "🧸",
                  },
                  {
                    title: "Detalhes para a casa",
                    desc: "Pequenos pontos de calor.",
                    href: "/loja?colecao=casa",
                    tag: "🏡",
                  },
                  {
                    title: "Datas especiais",
                    desc: "Aniversário, casamento, etc.",
                    href: "/loja?colecao=datas",
                    tag: "💐",
                  },
                ].map((c) => (
                  <Link
                    key={c.title}
                    href={c.href}
                    className="group rounded-3xl border border-[var(--green-100)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-zinc-900">
                          {c.title}
                        </div>
                        <p className="mt-2 text-sm text-[var(--text-muted)]">
                          {c.desc}
                        </p>
                      </div>
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--rose-100)] text-4xl sm:text-5xl">
                        {c.tag}
                      </div>
                    </div>

                    <div className="mt-5 text-sm font-semibold text-[var(--green-500)]">
                      Explorar{" "}
                      <span className="transition group-hover:translate-x-0.5 inline-block">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div>
                <Button href="/loja">Ver todas as peças</Button>
              </div>
            </div>
          </Container>
        </section>

        {/* PROCESSO */}
        <section className="bg-white py-14 sm:py-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <SectionTitle
                  eyebrow="O que torna único"
                  title="Cada peça começa do zero. Sempre."
                  subtitle="Nada aqui é produzido por máquinas. Cada detalhe é moldado à mão, pensado para alguém específico — talvez você, talvez quem você ama."
                />

                <div className="grid gap-3">
                  {[
                    "Modelagem manual e acabamento cuidadoso",
                    "Peças prontas + encomendas sob medida",
                    "Embalagem pensada para presentear",
                  ].map((x) => (
                    <div
                      key={x}
                      className="flex items-start gap-3 rounded-3xl border border-[var(--rose-100)] bg-white p-4 shadow-sm"
                    >
                      <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[var(--green-500)] text-white text-xs shadow-sm">
                        ✓
                      </div>
                      <p className="text-sm text-zinc-700">{x}</p>
                    </div>
                  ))}
                </div>

                <Button href="/sobre" variant="secondary">
                  Ver como funciona
                </Button>
              </div>

              <div className="rounded-[2rem] border border-[var(--rose-100)] bg-white p-6 shadow-sm">
                <div className="aspect-[16/10] w-full rounded-[1.5rem] bg-gradient-to-br from-[var(--rose-100)] via-white to-[var(--green-50)]">
                  <Image 
                    src="/fotos/4.jpeg" 
                    alt="Foto do processo de criação" 
                    width={600} 
                    height={375} 
                    className="object-cover rounded-[1.5rem] w-full h-full" /> 
                </div>
                <div className="mt-5">
                  <div className="text-sm font-semibold text-zinc-900">
                    Foto do processo
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Troque por imagens reais: mãos modelando, mesa de trabalho,
                    detalhes de pintura/acabamento.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* PERSONALIZAÇÃO */}
        <section className="bg-[var(--rose-50)] py-14 sm:py-20 border-y border-[var(--rose-100)]/70">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <SectionTitle
                  eyebrow="Personalizados"
                  title="Tem algo em mente? A gente cria junto."
                  subtitle="Você conta a ideia. Eu transformo em biscuit ou kit chimarrão - com carinho, intenção e um acabamento que faz valer a espera."
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: "💭", title: "Você imagina", desc: "Referências e ideia" },
                    { icon: "💬", title: "A gente conversa", desc: "Ajustes e detalhes" },
                    { icon: "🫶", title: "A peça nasce", desc: "Moldada à mão" },
                  ].map((step) => (
                    <div
                      key={step.title}
                      className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 shadow-sm hover:shadow-md transition"
                    >
                      <div className=" text-3xl sm:text-5xl">{step.icon}</div>
                      <div className="mt-3 text-sm font-semibold text-zinc-900">
                        {step.title}
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button href="/personalizados">Quero criar uma peça</Button>
                  <Button href="/contato" variant="secondary">
                    Tirar dúvidas
                  </Button>
                </div>
              </div>

              <div className="rounded-[2rem] border border-[var(--rose-100)] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-zinc-900">
                    Exemplo de briefing
                  </div>
                  <Badge>rápido &amp; simples</Badge>
                </div>

                <div className="mt-5 space-y-3 text-sm text-zinc-700">
                  <div className="rounded-3xl bg-[var(--rose-100)]/60 p-4">
                    <div className="text-xs text-[var(--text-muted)]">Ocasião</div>
                    <div className="mt-1 font-medium">Aniversário / Casamento</div>
                  </div>
                  <div className="rounded-3xl bg-[var(--rose-100)]/60 p-4">
                    <div className="text-xs text-[var(--text-muted)]">Tema</div>
                    <div className="mt-1 font-medium">Pet / profissão / hobbies / times de futebol</div>
                  </div>
                  <div className="rounded-3xl bg-[var(--rose-100)]/60 p-4">
                    <div className="text-xs text-[var(--text-muted)]">Detalhes</div>
                    <div className="mt-1 font-medium">
                      Cores, mensagem, elementos especiais
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button href="/personalizados" variant="secondary">
                    Preencher pedido personalizado
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* PROVA SOCIAL */}
        <section className="bg-white py-14 sm:py-20">
          <Container>
            <div className="space-y-8">
              <SectionTitle
                eyebrow="Quem já recebeu"
                title="Peças que já encontraram um lar 💛"
                // subtitle="Use fotos reais e depoimentos curtos (WhatsApp, Elo7, Instagram). Emoção vende mais do que nota."
              />

              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  { quote: "Foi presente e ela chorou. Ficou perfeito.", name: "Cliente (print WhatsApp)" },
                  { quote: "Chegou muito bem embalado e mais bonito ao vivo.", name: "Cliente (Elo7 / Instagram)" },
                  { quote: "Pedi personalizado e superou minha expectativa.", name: "Cliente (mensagem)" },
                ].map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-[var(--rose-100)] bg-white p-6 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-sm leading-relaxed text-zinc-700">
                      “{t.quote}”
                    </p>
                    <div className="mt-4 text-xs font-semibold text-[var(--rose-500)]">
                      — {t.name}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Image
                  src="/fotos/1.jpeg"
                  alt="Cliente feliz com peça recebida"
                  width={400}
                  height={400}
                  className="rounded-2xl object-cover"
                />
                <Image
                  src="/fotos/2.jpeg"
                  alt="Cliente feliz com peça recebida"
                  width={400}
                  height={400}
                  className="rounded-2xl object-cover"
                />
                <Image
                  src="/fotos/3.jpeg"
                  alt="Cliente feliz com peça recebida"
                  width={400}
                  height={400}
                  className="rounded-2xl object-cover"
                />
                <Image
                  src="/fotos/6.jpeg"
                  alt="Cliente feliz com peça recebida"
                  width={400}
                  height={400}
                  className="rounded-2xl object-cover"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* CTA FINAL */}
        <section className="border-t border-[var(--rose-100)] bg-[var(--green-50)] py-14 sm:py-20">
          <Container>
            <div className="rounded-[2.25rem] border border-[var(--green-100)] bg-white/70 p-8 shadow-sm backdrop-blur sm:p-10">
              <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
                <div className="lg:col-span-2">
                  <h3 className="font-playfair text-2xl font-semibold tracking-tight text-zinc-900">
                    Tradição que se compartilha: tudo para o seu chimarrão 🧉
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                    Encontre uma peça pronta para encantar — ou crie uma encomenda
                    com a sua história.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                  <Button href="/loja">Ver todas as peças</Button>
                  <Button href="/personalizados" variant="secondary">
                    Criar algo especial
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--rose-100)] py-10 bg-[var(--rose-50)]">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[var(--text-muted)]">
              <div className="font-playfair font-semibold text-zinc-900">
                Biscuit_eria
              </div>
              <div className="mt-1">Peças artesanais em biscuit — feitas à mão.</div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
                href="/politica"
              >
                Política
              </Link>
              <Link
                className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
                href="/trocas"
              >
                Trocas &amp; Envio
              </Link>
              <Link
                className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
                href="/contato"
              >
                Contato
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
