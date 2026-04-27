import Container from "../Container";
import Section from "../Section";
import SectionTitle from "../SectionTitle";
import Button from "../Button";

const occasions = [
  {
    key: "enfeites",
    icon: "🎁",
    title: "Enfeites",
    description: "Mimos artesanais para datas especiais, eventos, encontros e celebrações.",
  },
  {
    key: "times",
    icon: "⚽",
    title: "Times e paixões",
    description: "Detalhes inspirados no time, paixão ou história de quem vai receber.",
  },
  {
    key: "pets",
    icon: "🐾",
    title: "Pets",
    description: "Uma forma carinhosa de transformar bichinhos especiais em pequenas peças únicas.",
  },
  {
    key: "chimarrao",
    icon: "🧉",
    title: "Chimarrão",
    description: "Enfeites, cuias e acessórios para deixar esse momento ainda mais especial.",
  },
];

export default function Occasions() {
  return (
    <Section color="green">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <SectionTitle
              eyebrow="Ideias para presentear"
              title="Feito para momentos especiais"
              subtitle="Uma peça artesanal pode marcar uma data, contar uma história ou transformar um detalhe simples em uma lembrança cheia de significado."
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/colecoes">Ver coleções</Button>
              <Button href="/personalizados" variant="secondary">
                Pedir personalizado
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {occasions.map((item) => (
              <div
                key={item.key}
                className="rounded-3xl border border-[var(--green-100)]/70 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="text-3xl">{item.icon}</div>

                <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}