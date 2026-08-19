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

  const businessHours = "Segunda à Sexta, das 9h às 18h";
  const responseTime = "Respondemos o mais rápido possível.";
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  const contactEmailUrl = process.env.NEXT_PUBLIC_CONTACT_EMAIL
    ? "mailto:" + process.env.NEXT_PUBLIC_CONTACT_EMAIL
    : null;

  const contact = {
    whatsappUrl,
    instagramUrl,
    contactEmailUrl,
  };

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-10">
              <Badge>Contato</Badge>

              <h1 className="font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                Vamos conversar?
              </h1>

              <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Use este canal para dúvidas gerais, informações sobre a loja,
                pedidos já feitos ou qualquer outra pergunta.
              </p>

              <p className="text-xs text-[var(--text-muted)] sm:text-sm">
                {businessHours} • {responseTime}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              {contact.instagramUrl ? (
                <LinkCard
                  title="Instagram"
                  description="Acompanhe novidades, bastidores e peças prontas."
                  href={contact.instagramUrl}
                  linktext="Ver perfil"
                  tag="📷"
                  target="_blank"
                />
              ) : null}

              {contact.contactEmailUrl ? (
                <LinkCard
                  title="E-mail"
                  description="Se preferir, envie uma mensagem por e-mail para dúvidas ou acompanhamento."
                  href={contact.contactEmailUrl}
                  linktext="Enviar e-mail"
                  tag="✉️"
                />
              ) : null}

            </div>
          </div>
        </Container>
      </Section>

      <div id="formulario" />

      <Section color="green">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <SectionTitle
                eyebrow="Mensagem"
                title="Envie sua mensagem por aqui"
                subtitle={
                  contact.whatsappUrl
                    ? "Preencha o formulário e continue a conversa pelo WhatsApp."
                    : "Use os canais disponíveis para entrar em contato."
                }
              />

              <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Se você quiser montar produtos personalizados, temos uma
                <a
                  className="ml-2 font-semibold text-[var(--rose-300)] underline-offset-4 hover:underline"
                  href="/personalizados"
                >
                  página específica para isso
                </a>
                . 😁
              </p>


            </div>

            <ContactForm whatsappBaseUrl={contact.whatsappUrl || ""} />
          </div>
        </Container>
      </Section>
    </div>
  );
}