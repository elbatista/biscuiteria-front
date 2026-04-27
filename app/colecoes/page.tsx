import Container from "@/components/Container";
import Section from "@/components/Section";
import Badge from "@/components/Badge";
import CollectionsGrid from "@/components/collections/CollectionsGrid";
import { getCollectionsIndexPageData } from "@/lib/server/collections";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata = {
  title: "Coleções | Biscuit_eria",
  description:
    "Explore todas as coleções da Biscuit_eria e descubra seleções especiais por estilo, ocasião e proposta.",
};

export default async function CollectionsIndexPage() {
  const collections = await getCollectionsIndexPageData();

  return (
    <>
    <AnnouncementBar/>
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Section>
        <Container>
          <div className="space-y-8">
            <div className="rounded-3xl border border-[var(--rose-100)] bg-white/80 p-6 shadow-sm sm:p-8">
              <div className="max-w-3xl space-y-3">
                <Badge>Coleções</Badge>

                <h1 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                  Explore todas as coleções
                </h1>

                <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                  Descubra seleções especiais por tema, ocasião ou estilo para
                  encontrar com mais facilidade o que combina com você.
                </p>
              </div>
            </div>

            {collections.length === 0 ? (
              <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-6">
                <div className="space-y-3">
                  <h2 className="font-playfair text-2xl font-semibold text-zinc-900">
                    Nenhuma coleção disponível
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                    Ainda estamos organizando as coleções. Volte em breve para
                    conferir as novidades.
                  </p>
                </div>
              </div>
            ) : (
              <CollectionsGrid collections={collections} />
            )}
          </div>
        </Container>
      </Section>
    </div>
    </>
  );
}