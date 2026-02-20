
import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Section from "@/components/Section";
import SectionTitle from "@/components/SectionTitle";
import LinkCard from "@/components/LinkCard";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contato | Biscuit_eria",
  description:
    "Fale com a Biscuit_eria para tirar dúvidas, solicitar personalização ou acompanhar seu pedido.",
};

export default function ContatoPage() {
  // Preencha com seus dados reais
  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const instagramHref = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const businessHours = "Segunda à Sexta, das 9h às 18h";
  const responseTime = "Respondemos em até 24h";

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      {/* HERO (estilo home) */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-10">
              <Badge>Contato</Badge>

              <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
                Vamos conversar?
              </h1>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                Use este canal para dúvidas gerais, informações sobre a loja, pedidos já feitos ou qualquer outra pergunta.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button href="#formulario">
                  Enviar mensagem
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                {businessHours} • {responseTime}
              </p>
            </div>

            {/* Cards à direita (visual home) */}
            <div className="grid gap-4 sm:grid-cols-2">
              <LinkCard
                title="WhatsApp"
                description="O jeito mais rápido de tirar dúvidas e alinhar personalizações."
                href={whatsappHref}
                linktext="Abrir WhatsApp"
                tag={"💬"}
                target="_blank"
              />
              <LinkCard
                title="Instagram"
                description="Acompanhe novidades, bastidores e peças prontas."
                href={instagramHref}
                linktext="Ver perfil"
                tag={"📷"}
                target="_blank"
              />
              <LinkCard
                title="Prazos & Envio"
                description="Veja como funcionam produção, postagem e avarias."
                href="/trocas"
                linktext="Ver Trocas & Envio"
                tag={"🚚"}
              />
            </div>
          </div>
        </Container>
      </Section>

    <div id="formulario"></div>
      {/* FORM */}
      <Section color="green">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <SectionTitle
                eyebrow="Mensagem"
                title="Prefere enviar por aqui?"
                subtitle="Preencha o formulário e eu respondo assim que possível."
              />

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                Se você quiser montar produtos personalizados, temos uma 
                <a
                    className="ml-2 font-semibold text-[var(--rose-300)] hover:underline underline-offset-4"
                    href="/personalizados"
                >
                    página específica para isso
                </a>
                . 😁
              </p>

              <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-5 text-sm text-[var(--text-muted)]">
                <strong>Dica:</strong> se você já tem uma data importante (ex.: festa, casamento), fale isso logo no começo.
                Assim eu consigo te dizer rapidamente se dá tempo 🙂
              </div>
            </div>

            <ContactForm whatsappBaseUrl={whatsappHref || ""}/>
          </div>
        </Container>
      </Section>

      {/* FAQ QUICK */}
      <Section>
        <Container>
          <SectionTitle
            eyebrow="FAQ"
            title="Dúvidas rápidas"
            subtitle="As perguntas mais comuns antes de encomendar."
          />

          <div className="grid gap-4 lg:grid-cols-3 mt-4">
            <LinkCard
              title="Qual é o prazo?"
              description="O prazo depende da peça e da agenda. Em geral: produção + envio. Me diga a data e eu te confirmo."
              href="/trocas"
              linktext="Ver detalhes"
              tag={"🕘"}
            />
            <LinkCard
              title="Vocês fazem personalizados?"
              description="Sim! Você manda o tema e referências e eu te proponho opções (com valores e prazo)."
              href={whatsappHref}
              linktext="Pedir orçamento no WhatsApp"
              tag={"🎨"}
              target="_blank"
            />
            <LinkCard
              title="Posso enviar referência por foto?"
              description="Pode sim — por WhatsApp ou Instagram. Assim eu entendo melhor o estilo que você quer."
              href={instagramHref}
              linktext="Enviar no Instagram"
              tag={"📷"}
              target="_blank"
            />
          </div>
        </Container>
      </Section>
    </div>
  );
}