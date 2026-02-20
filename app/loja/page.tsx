import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Section from "@/components/Section";
import SectionTitle from "@/components/SectionTitle";
import SimpleCard from "@/components/SimpleCard";
import LinkCard from "@/components/LinkCard";

export const metadata = {
  title: "Loja | Biscuit_eria",
  description:
    "A loja da Biscuit_eria está em construção. Em breve: enfeites e acessórios para chimarrão, peças prontas e novidades.",
};

export default function LojaPage() {
  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const instagramHref = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      {/* HERO */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <Badge>Loja</Badge>

              <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
                🚧 🚜 👷🏼‍♀️
              </h1>
              <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
                Estamos preparando algo bem bonito 🧉✨
              </h1>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                A loja está em construção — mas já já ela vai abrir com{" "}
                <strong>enfeites e acessórios para chimarrão</strong>, peças prontas e
                novidades em edição limitada.
              </p>

              <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-5">
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  <strong className="text-zinc-900">Disponível em breve.</strong>{" "}
                  As primeiras coleções vão sair em pequenos lotes e podem esgotar rápido.
                  Se você quer ser um dos primeiros a saber, me chama no WhatsApp ou acompanha no Instagram.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button target="_blank" href={whatsappHref} variant="primary">
                  Entrar na lista do WhatsApp
                </Button>
                <Button target="_blank" href={instagramHref} variant="secondary">
                  Acompanhar no Instagram
                </Button>
              </div>

            </div>

            {/* Cards estilo home */}
            <div className="grid gap-4 sm:grid-cols-2">
              <SimpleCard
                title="Primeiros lotes"
                description="Pequenas quantidades, tudo artesanal — quando acaba, só no próximo."
              />
              <SimpleCard
                title="Coleções temáticas"
                description="Enfeites para chimarrão com temas e detalhes que mudam ao longo do ano."
              />
              <SimpleCard
                title="Peças prontas"
                description="Algumas peças já vão estar disponíveis para envio rápido."
              />
              <LinkCard
                title="Personalização"
                description="Mesmo com a loja, você ainda vai poder pedir algo do seu jeito."
                href="/contato"
                linktext="Pedir orçamento"
                tag="🎨"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* O QUE VAI TER */}
      <Section>
        <Container>
          <SectionTitle
            eyebrow="O que vem aí"
            title="A loja vai abrir com novidades pensadas para o seu mate"
            subtitle="Tudo feito à mão, com cuidado no acabamento e detalhes que deixam a cuia ainda mais especial."
          />

          <div className="grid gap-4 lg:grid-cols-3 mt-4">
            <SimpleCard title="Enfeites de chimarrão" description="Detalhes que decoram a cuia e deixam seu ritual ainda mais único." icon="🌼"/>
            <SimpleCard title="Acessórios" description="Pequenos complementos para o dia a dia do mate — práticos e bonitos." icon="🎀"/>
            <SimpleCard title="Cuias selecionadas" description="Cuias e itens escolhidos com carinho para combinar com as coleções." icon="🧉"/>
          </div>
        </Container>
      </Section>

      {/* CTA FINAL */}
      <Section>
        <Container>
          <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-100)] p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="space-y-3">
                <h2 className="font-playfair text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
                  Quer pegar o primeiro lote?
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  Me chama no WhatsApp e manda um “quero entrar na lista” 🧉  
                  Assim você recebe o aviso antes de todo mundo quando a loja abrir.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Button target="_blank" href={whatsappHref} variant="primary">
                  Entrar na lista
                </Button>
                <Button href="/sobre" variant="secondary">
                  Conhecer a história
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}