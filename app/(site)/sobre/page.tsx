import type { Metadata } from "next";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";

import Badge from "@/components/Badge";
import BasicRichText from "@/components/content/BasicRichText";
import Button from "@/components/Button";
import Container from "@/components/Container";
import LinkCard from "@/components/LinkCard";
import Section from "@/components/Section";
import SectionTitle from "@/components/SectionTitle";
import SimpleCard from "@/components/SimpleCard";
import { getPublicAboutPageSettings } from "@/lib/server/public-about-page-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicAboutPageSettings();

  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
  };
}

function renderAuthorTitle(title: string, makerName: string): ReactNode {
  if (!makerName) return title;

  const index = title.toLocaleLowerCase().indexOf(makerName.toLocaleLowerCase());

  if (index === -1) return title;

  const before = title.slice(0, index);
  const name = title.slice(index, index + makerName.length);
  const after = title.slice(index + makerName.length);

  return (
    <>
      <Fragment>{before}</Fragment>
      <span className="italic">{name}</span>
      <Fragment>{after}</Fragment>
    </>
  );
}

export default async function SobrePage() {
  const settings = await getPublicAboutPageSettings();

  const brand = "Biscuit_eria";
  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_URL || "/contato";
  const instagramHref = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "/contato";

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      {/* HERO */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Texto */}
            <div className="space-y-6">
              <Badge>{settings.authorBadge}</Badge>

              <h2 className="font-playfair text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
                {renderAuthorTitle(settings.authorTitle, settings.makerName)}
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)] max-w-xl">
                <BasicRichText text={settings.authorDescription1} />
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)] max-w-xl">
                <BasicRichText text={settings.authorDescription2} />
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)] max-w-xl">
                <BasicRichText text={settings.authorHighlight} />
              </p>

              {/* “Provas rápidas” */}
              <div className="grid gap-3 sm:grid-cols-3">
                <SimpleCard title="100% artesanal" description="Feito à mão, peça a peça" icon="🖐🏻" />
                <SimpleCard title="Sob encomenda" description="Personalizo do seu jeito" icon="🎨" />
                <SimpleCard title="Tudo para o seu chima!" description="Pra nao deixar a tradicao morrer" icon="🧉" />
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
                  src={settings.authorImageMainUrl || "/autora/autora-1.jpeg"}
                  alt={settings.authorImageMainAlt || `Foto da autora do ${brand}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>

              {/* Duas fotos menores */}
              <div className="grid gap-4 grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-white/60 aspect-[4/3]">
                  <Image
                    src={settings.authorImageSecondUrl || "/autora/autora-2.jpeg"}
                    alt={settings.authorImageSecondAlt || "Bastidores: modelando uma peça em biscuit"}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, 50vw"
                  />
                </div>
                <div className="relative overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-white/60 aspect-[4/3]">
                  <Image
                    src={settings.authorImageThirdUrl || "/autora/autora-4.jpeg"}
                    alt={settings.authorImageThirdAlt || "Bastidores: pintura e detalhes de acabamento"}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, 50vw"
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
              <Badge>{settings.brandBadge}</Badge>

              <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
                {settings.brandTitle}
              </h1>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                <BasicRichText text={settings.brandDescription1} />
              </p>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                <BasicRichText text={settings.brandDescription2} />
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button target={whatsappHref ? "_blank" : undefined} href={whatsappHref}>
                  Falar comigo no whats
                </Button>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                Feito por <strong>{settings.makerName}</strong> em <strong>{settings.city}</strong> • {settings.sinceText}
              </p>
            </div>

            
          </div>
        </Container>
      </Section>

      {/* HISTÓRIA */}
      <Section>
        <Container>
          <SectionTitle
            eyebrow={settings.historyEyebrow}
            title={settings.historyTitle}
            subtitle={settings.historySubtitle}
          />

          <div className="grid gap-6 lg:grid-cols-3 mt-4">
            <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-6 lg:col-span-2">
              <div className="space-y-4">
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  <BasicRichText text={settings.historyDescription1} />
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
                  <BasicRichText text={settings.historyDescription2} />
                </p>
              </div>
            </div>

          </div>
        </Container>
      </Section>

      {/* SOCIAL PROOF / MINI SEÇÃO */}
      <Section color="green">
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
                  target={instagramHref ? "_blank" : undefined}
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

    </div>
  );
}
