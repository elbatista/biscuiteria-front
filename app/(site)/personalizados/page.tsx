import Badge from "@/components/Badge";
import Container from "@/components/Container";
import PersonalizadoWizard from "@/components/PersonalizadoWizard";
import Section from "@/components/Section";

export const metadata = {
  title: "Personalizados | Biscuit_eria",
  description:
    "Monte seu pedido personalizado de forma simples e envie tudo organizado pelo WhatsApp.",
};

export default function PersonalizadosPage() {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL;

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 space-y-5 text-center sm:mb-10">
              <div className="flex justify-center">
                <Badge>Personalizados</Badge>
              </div>

              <h1 className="font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                Monte seu pedido do jeitinho que você imaginou 🧉✨
              </h1>

              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Conte o básico da sua ideia e, no final,
                envie tudo organizado pelo WhatsApp.
              </p>
            </div>

            <PersonalizadoWizard
              whatsappBaseUrl={whatsappUrl || ""}
            />
          </div>
        </Container>
      </Section>
    </div>
  );
}