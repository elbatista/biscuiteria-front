import Link from "next/link";

import Button from "@/components/Button";
import Container from "@/components/Container";
import Section from "@/components/Section";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import LatestCollectionsPreview from "@/components/store/LatestCollectionsPreview";
import StoreAvailabilityBanner from "@/components/store/StoreAvailabilityBanner";
import StoreCategoryFilters from "@/components/store/StoreCategoryFilters";
import StoreEmptyState from "@/components/store/StoreEmptyState";
import StoreHero from "@/components/store/StoreHero";
import StoreProductsGrid from "@/components/store/StoreProductsGrid";
import { buildStoreHref } from "@/components/store/store-query";
import { getStorePageData } from "@/lib/server/store";
import { getPublicStoreSettings } from "@/lib/server/public-store-settings";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata = {
  title: "Loja | Biscuit_eria",
  description:
    "Explore a loja da Biscuit_eria por coleções e categorias. Descubra enfeites, acessórios e peças feitas à mão para deixar seu chimarrão ainda mais especial.",
};

type LojaPageSearchParams = {
  categoria?: string | string[];
  colecao?: string | string[];
  sort?: string | string[];
};

type LojaPageProps = {
  searchParams?: Promise<LojaPageSearchParams>;
};

export default async function LojaPage({ searchParams }: LojaPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const [settings, data] = await Promise.all([
    getPublicStoreSettings(),
    getStorePageData({
      categorySlug: resolvedSearchParams?.categoria,
      collectionSlug: resolvedSearchParams?.colecao,
      sort: resolvedSearchParams?.sort,
    }),
  ]);

  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_URL || "/contato";
  const instagramHref = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "/contato";

  const activeFilters = [
    data.selectedCollection
      ? { label: `Coleção: ${data.selectedCollection.title}` }
      : null,
    data.selectedCategory
      ? { label: `Categoria: ${data.selectedCategory.name}` }
      : null,
  ].filter(Boolean) as Array<{ label: string }>;

  return (
    <>
    <AnnouncementBar/>
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Section>
        <Container>
          <div className="space-y-8">
            {/* <StoreHero
              whatsappHref={whatsappHref}
              instagramHref={instagramHref}
            /> */}

            <StoreAvailabilityBanner settings={settings} />

            <StoreCategoryFilters
              categories={data.categories}
              activeCategorySlug={data.selectedCategory?.slug ?? null}
              currentCollectionSlug={data.selectedCollection?.slug ?? null}
              currentSort={data.sort}
            />

            <CatalogToolbar
              totalItems={data.totalProducts}
              sortOptions={[
                {
                  label: "Destaques",
                  href: buildStoreHref({
                    categoria: data.selectedCategory?.slug ?? null,
                    colecao: data.selectedCollection?.slug ?? null,
                    sort: "featured",
                  }),
                  active: data.sort === "featured",
                },
                {
                  label: "Mais recentes",
                  href: buildStoreHref({
                    categoria: data.selectedCategory?.slug ?? null,
                    colecao: data.selectedCollection?.slug ?? null,
                    sort: "recent",
                  }),
                  active: data.sort === "recent",
                },
                {
                  label: "Menor preço",
                  href: buildStoreHref({
                    categoria: data.selectedCategory?.slug ?? null,
                    colecao: data.selectedCollection?.slug ?? null,
                    sort: "price-asc",
                  }),
                  active: data.sort === "price-asc",
                },
                {
                  label: "Maior preço",
                  href: buildStoreHref({
                    categoria: data.selectedCategory?.slug ?? null,
                    colecao: data.selectedCollection?.slug ?? null,
                    sort: "price-desc",
                  }),
                  active: data.sort === "price-desc",
                },
              ]}
              activeFilters={activeFilters}
              clearFiltersHref={activeFilters.length > 0 ? "/loja" : null}
            />

            {data.products.length === 0 ? (
              <StoreEmptyState hasFilters={activeFilters.length > 0} />
            ) : (
              <StoreProductsGrid
                products={data.products}
                canAcceptOrders={settings.canAcceptOrders}
                orderUnavailableReason={settings.orderUnavailableReason}
              />
            )}
          </div>
        </Container>
      </Section>

      <Section color="green">
        <Container>
          <div className="space-y-6">
            <LatestCollectionsPreview collections={data.latestCollections} />

            <div>
              <div>
                <Button href="/colecoes" variant="secondary">
                  Ver todas as coleções
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-5">
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                <strong className="text-zinc-900">
                  Não achou exatamente o que queria?
                </strong>{" "}
                Você pode pedir um produto personalizado. É só{" "}
                <Link
                  href="/personalizados"
                  className="text-[var(--green-500)] hover:underline"
                >
                  preencher o formulário
                </Link>{" "}
                e enviar as referências.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-100)] p-8 sm:p-10">
              <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                <div className="space-y-3">
                  <h2 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                    Quer acompanhar os próximos lançamentos?
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                    Me chama no WhatsApp ou acompanha no Instagram para ver novas
                    coleções, peças especiais e produtos personalizados.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <Button
                    target={whatsappHref ? "_blank" : undefined}
                    href={whatsappHref}
                    variant="primary"
                  >
                    Falar no WhatsApp
                  </Button>

                  <Button
                    target={instagramHref ? "_blank" : undefined}
                    href={instagramHref}
                    variant="secondary"
                  >
                    Ir para o Instagram
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
    </>
  );
}