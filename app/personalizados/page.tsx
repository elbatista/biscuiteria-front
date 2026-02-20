import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Section from "@/components/Section";
import SectionTitle from "@/components/SectionTitle";
import SimpleCard from "@/components/SimpleCard";
import PersonalizadoWizard from "@/components/PersonalizadoWizard";

export const metadata = {
  title: "Personalizados | Biscuit_eria",
  description: "Monte seu pedido personalizado de forma guiada. No final, envie tudo pelo WhatsApp (incluindo fotos e vídeos).",
};

export default function PersonalizadosPage() {
  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      {/* HERO */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <Badge>Personalizados</Badge>

              <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
                Monte seu pedido do jeitinho que você imaginou 🧉✨
              </h1>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                Aqui você monta um pedido de forma bem guiada. No final, eu já recebo tudo organizado —
                e se você quiser enviar <strong>fotos ou vídeos</strong>, é só continuar pelo WhatsApp.
              </p>

              <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-5">
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  <strong className="text-zinc-900">Dica:</strong> a maioria dos personalizados é para datas especiais
                  (lembrancinhas, presentes, topo de bolo). Se for um enfeite simples, geralmente eu preciso só de{" "}
                  <strong>cores</strong> e detalhes. Por exemplo, se for um personagem, mande detalhes como <strong>tipo de cabelo / cor dos olhos</strong>.
                </p>
              </div>
            </div>

            {/* Cards estilo home */}
            <div className="grid gap-4 sm:grid-cols-2">
              <SimpleCard
                title="Bem guiado"
                description="Você escolhe opções passo a passo — sem ficar perdido."
                icon="✅"
              />
              <SimpleCard
                title="Datas especiais"
                description="A gente alinha prazo e detalhes com carinho e transparência."
                icon="📅"
              />
              <SimpleCard
                title="Fotos e vídeos"
                description="Envie tudo pelo WhatsApp no final, bem fácil."
                icon="📷"
              />
              <SimpleCard
                title="Feito à mão"
                description="Cada peça é artesanal, com acabamento e atenção aos detalhes."
                icon="🎨"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* FORM */}
      <Section>
        <Container>
          <SectionTitle
            eyebrow="Seu pedido"
            title="Vamos montar seu personalizado"
            subtitle="Preencha o passo a passo. No final, você pode enviar pelo WhatsApp com um clique."
          />

          <div className="mt-6">
            <PersonalizadoWizard />
          </div>
        </Container>
      </Section>
    </div>
  );
}