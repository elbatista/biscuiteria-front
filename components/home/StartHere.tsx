import Container from "../Container";
import Section from "../Section";
import SectionTitle from "../SectionTitle";
import Button from "../Button";

const paths = [
  {
    key: "loja",
    icon: "🛍️",
    title: "Peças prontas",
    description:
      "Veja as peças disponíveis para comprar agora e receber em casa com todo cuidado.",
    href: "/loja",
    cta: "Ir para a loja",
  },
  {
    key: "colecoes",
    icon: "✨",
    title: "Coleções",
    description:
      "Explore peças organizadas por temas, ocasiões e estilos para encontrar mais rápido o que combina com você.",
    href: "/colecoes",
    cta: "Ver coleções",
  },
  {
    key: "personalizados",
    icon: "🎨",
    title: "Personalizados",
    description:
      "Conte sua ideia, escolha os detalhes e crie uma peça única para presentear ou deixar o chimarrão com a sua cara.",
    href: "/personalizados",
    cta: "Criar personalizado",
  },
];

export default function StartHere() {
  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Por onde começar"
              title="Escolha o caminho que combina com você"
              subtitle="Você pode comprar uma peça pronta, navegar pelas coleções ou encomendar algo feito especialmente para a sua ideia."
            />

            <div className="hidden sm:block">
              <Button href="/colecoes" variant="secondary">
                Explorar coleções
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {paths.map((item) => (
              <div
                key={item.key}
                className="flex h-full flex-col rounded-[2rem] border border-[var(--rose-100)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-4xl">{item.icon}</div>

                <div className="mt-5">
                  <h3 className="font-playfair text-2xl font-semibold text-zinc-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 flex flex-1 items-end">
                  <Button href={item.href} variant={item.key === "loja" ? "primary" : "secondary"}>
                    {item.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}