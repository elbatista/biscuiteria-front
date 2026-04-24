import Container from "../Container";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import Button from "../Button";
import CollectionsGrid from "@/components/collections/CollectionsGrid";
import { getHomeLatestCollections } from "@/lib/server/home";

export default async function Collections() {
  const collections = await getHomeLatestCollections(3);

  if (collections.length === 0) {
    return null;
  }

  return (
    <Section color="green">
      <Container>
        <div className="flex flex-col gap-8">
          <SectionTitle
            eyebrow="Coleções"
            title="As coleções mais recentes da loja"
            subtitle="Explore as últimas seleções adicionadas para descobrir novidades, temas e curadorias especiais."
          />

          <CollectionsGrid collections={collections} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              Quer navegar por todas as coleções disponíveis?
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/colecoes" variant="secondary">
                Ver todas as coleções
              </Button>
              <Button href="/loja">Ir para a loja</Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}