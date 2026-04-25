import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Section from "@/components/Section";
import SectionTitle from "@/components/SectionTitle";
import SimpleCard from "@/components/SimpleCard";
import LinkCard from "@/components/LinkCard";
import Image from "next/image";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";

export const metadata = {
  title: "Sobre | Biscuit_eria",
  description:
    "Conheça a história da Biscuit_eria, o cuidado por trás das peças artesanais em biscuit e como funciona o processo de criação.",
};

export default async function SobrePage() {
  const contact = await getPublicStoreContactSettings();

  const brand = contact.storeName;
  const makerName = "Eliadi";
  const city = "São Leopoldo / RS";
  const years = "desde 2021";
  const whatsappHref = contact.whatsappUrl || "/contato";
  const instagramHref = contact.instagramUrl || "/contato";

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      {/* HERO */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Texto */}
            <div className="space-y-6">
              <Badge>Sobre a autora</Badge>

              <h2 className="font-playfair text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
                Oi! Eu sou a <span className="italic">Eliadi</span> 👋
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)] max-w-xl">
                Eu crio peças em biscuit com um objetivo simples: transformar momentos em lembranças que dão vontade de guardar. Cada encomenda passa por um processo artesanal — do modelado à pintura — com atenção aos detalhes e muito carinho.
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)] max-w-xl">
                Sou <strong>gaúcha</strong>, apaixonada por <strong>chimarrão</strong>, daqueles que acompanham o dia inteiro. Gosto de enfeitar a cuia, cuidar dos detalhes e aproveitar essa <strong>tradição</strong> ao lado do meu marido, Emerson. Acho que esse cuidado, essa pausa e esse afeto acabam aparecendo também nas minhas peças.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)] max-w-xl">
                <strong>Bora tomar um chima!</strong>
              </p>

              {/* “Provas rápidas” */}
              <div className="grid gap-3 sm:grid-cols-3">
                <SimpleCard title={"100% artesanal"} description="Feito à mão, peça a peça" icon="🖐🏻" />
                <SimpleCard title={"Sob encomenda"} description="Personalizo do seu jeito" icon="🎨" />
                <SimpleCard title={"Tudo para o seu chima!"} description="Pra nao deixar a tradicao morrer" icon="🧉" />
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button href="/contato" variant="primary">
                  Falar comigo
                </Button>
                <Button href="/loja" variant="secondary">
                  Ver Loja
                </Button>
              </div>
            </div>

            {/* Fotos */}
            <div className="grid gap-4">
              {/* Foto principal */}
              <div className="relative overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-white/60 shadow-sm aspect-[4/3]">
                <Image
                  src="/autora/autora-1.jpeg"
                  alt={`Foto da autora do ${brand}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Duas fotos menores */}
              <div className="grid gap-4 grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-white/60 aspect-[4/3]">
                  <Image
                    src="/autora/autora-2.jpeg"
                    alt="Bastidores: modelando uma peça em biscuit"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-white/60 aspect-[4/3]">
                  <Image
                    src="/autora/autora-4.jpeg"
                    alt="Bastidores: pintura e detalhes de acabamento"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section color="rose">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <Badge>Sobre a {brand}</Badge>

              <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
                Artesanato que vira lembrança
              </h1>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                A <strong>{brand}</strong> nasceu do desejo de transformar momentos em pequenas peças
                cheias de significado. Cada encomenda é feita à mão, com calma e atenção aos detalhes —
                do primeiro rascunho até a embalagem final.
              </p>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                Entre um chimarrão e outro, vou modelando ideias com calma. Esse cuidado com o tempo e
                com os detalhes também faz parte do meu processo criativo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  target={contact.whatsappUrl ? "_blank" : undefined}
                  href={whatsappHref}
                >
                  Falar comigo no whats
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Feito por <strong>{makerName}</strong> em <strong>{city}</strong> • {years}
              </p>
            </div>

            {/* Cards estilo home */}
            <div className="grid gap-4 sm:grid-cols-2">
              <SimpleCard
                title="Feito à mão"
                description="Cada peça é modelada manualmente — sem produção em massa."
              />
              <SimpleCard
                title="Peças únicas"
                description="Variações sutis fazem parte do charme do artesanal."
              />
              <LinkCard
                title="Personalização"
                description="Tema, cores, detalhes e referências para ficar do seu jeito."
                href="/personalizados"
                linktext="Como funciona"
                tag={"🎨"}
              />
              <LinkCard
                title="Entrega com cuidado"
                description="Embalagem pensada para proteger peças delicadas."
                href="/trocas"
                linktext="Trocas & Envio"
                tag={"📦"}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* HISTÓRIA */}
      <Section>
        <Container>
          <SectionTitle
            eyebrow="Nossa história"
            title="De ideia a peça: um processo com carinho"
            subtitle="Um pouco do que inspira o trabalho e como as encomendas ganham vida."
          />

          <div className="grid gap-6 lg:grid-cols-3 mt-4">
            <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-6 lg:col-span-2">
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  Tudo começou em torno do <strong>chimarrão</strong>. Entre uma cuia e outra, fui percebendo que os presentes mais especiais são aqueles que contam uma <strong>história e carregam afeto</strong>.
                  A tradição do mate, tão presente no meu dia a dia, despertou a vontade de criar enfeites para chimarrão, peças que deixassem esse momento ainda mais bonito e cheio de significado.
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  A partir daí, o <strong>biscuit</strong> virou a matéria-prima perfeita para transformar ideias em <strong>enfeites, acessórios e detalhes para chimarrão</strong>, além de miniaturas e lembranças personalizadas. Cada peça é feita à mão, com calma, delicadeza e atenção ao acabamento — do jeitinho que acredito que o artesanal deve ser. Assim, consigo adaptar cada encomenda para o que você realmente quer, sem “cara de produto pronto”.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-6 shadow-sm">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-900">O que você pode pedir</div>
                <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--text-muted)]">
                  <li>Enfeites de cuias e bombas</li>
                  <li>Acessórios para chimarrão</li>
                  <li>Lembrancinhas e brindes</li>
                  <li>Miniaturas e personagens</li>
                  <li>Topo de bolo (casamento, aniversário, batizado)</li>
                  <li>Decoração temática</li>
                  <li>Peças personalizadas sob encomenda</li>
                </ul>

                <div className="pt-3">
                  <Button href="/contato" variant="secondary">
                    Pedir orçamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* VALORES / DIFERENCIAIS */}
      <Section color="green">
        <Container>
          <SectionTitle
            eyebrow="O que guia o trabalho"
            title="Qualidade, cuidado e transparência"
            subtitle="Coisas simples que fazem toda a diferença quando você compra algo artesanal."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            <SimpleCard
              title="Comunicação clara"
              description="Alinhamos expectativas de prazo, referências e detalhes antes de produzir."
            />
            <SimpleCard
              title="Acabamento"
              description="Atenção aos detalhes e ao resultado final — do modelado à pintura."
            />
            <SimpleCard
              title="Embalagem"
              description="Proteção reforçada para peças delicadas e envio mais seguro."
            />
            <SimpleCard
              title="Processo artesanal"
              description="Tempo e cuidado fazem parte do valor da peça — sem pressa."
            />
          </div>
        </Container>
      </Section>

      {/* SOCIAL PROOF / MINI SEÇÃO */}
      <Section>
        <Container>
          <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="space-y-3">
                <h2 className="font-playfair text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
                  Quer ver mais peças e bastidores?
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  No Instagram eu compartilho novidades, peças prontas, processo e inspirações para encomendas.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Button
                  target={contact.instagramUrl ? "_blank" : undefined}
                  href={instagramHref}
                  variant="primary"
                >
                  Ver Instagram
                </Button>
                <Button href="/loja" variant="secondary">
                  Ver loja
                </Button>
              </div>
            </div>
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
                  Vamos transformar sua ideia em uma peça?
                </h2>
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  Me diga o tema, a ocasião e a data. Eu te respondo com opções, valores e prazo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <Button href="/contato" variant="primary">
                  Falar comigo
                </Button>
                <Button href="/trocas" variant="secondary">
                  Prazos & Envio
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}