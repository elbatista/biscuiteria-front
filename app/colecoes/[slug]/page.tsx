import { notFound } from "next/navigation";

import Container from "@/components/Container";
import Section from "@/components/Section";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";
import CollectionCategoryFilters from "@/components/collections/CollectionCategoryFilters";
import CollectionEmptyState from "@/components/collections/CollectionEmptyState";
import CollectionHero from "@/components/collections/CollectionHero";
import { buildCollectionHref } from "@/components/collections/collection-query";
import StoreProductsGrid from "@/components/store/StoreProductsGrid";
import { getCollectionPageData } from "@/lib/server/collections";

type CollectionPageSearchParams = {
  categoria?: string | string[];
  sort?: string | string[];
};

type CollectionPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<CollectionPageSearchParams>;
};

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const data = await getCollectionPageData({
    slug: resolvedParams.slug,
    categorySlug: resolvedSearchParams?.categoria,
    sort: resolvedSearchParams?.sort,
  });

  if (!data) {
    notFound();
  }

  const activeFilters = data.selectedCategory
    ? [{ label: `Categoria: ${data.selectedCategory.name}` }]
    : [];

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <CollectionHero
        title={data.collection.title}
        description={data.collection.description}
        coverImageUrl={data.collection.coverImageUrl}
        isFeatured={data.collection.isFeatured}
      />

      <Section>
        <Container>
          <div className="space-y-8">
            <CollectionCategoryFilters
              collectionSlug={data.collection.slug}
              categories={data.categories}
              activeCategorySlug={data.selectedCategory?.slug ?? null}
              currentSort={data.sort}
            />

            <CatalogToolbar
              totalItems={data.totalProducts}
              sortOptions={[
                {
                  label: "Destaques",
                  href: buildCollectionHref(data.collection.slug, {
                    categoria: data.selectedCategory?.slug ?? null,
                    sort: "featured",
                  }),
                  active: data.sort === "featured",
                },
                {
                  label: "Mais recentes",
                  href: buildCollectionHref(data.collection.slug, {
                    categoria: data.selectedCategory?.slug ?? null,
                    sort: "recent",
                  }),
                  active: data.sort === "recent",
                },
                {
                  label: "Menor preço",
                  href: buildCollectionHref(data.collection.slug, {
                    categoria: data.selectedCategory?.slug ?? null,
                    sort: "price-asc",
                  }),
                  active: data.sort === "price-asc",
                },
                {
                  label: "Maior preço",
                  href: buildCollectionHref(data.collection.slug, {
                    categoria: data.selectedCategory?.slug ?? null,
                    sort: "price-desc",
                  }),
                  active: data.sort === "price-desc",
                },
              ]}
              activeFilters={activeFilters}
              clearFiltersHref={
                activeFilters.length > 0 ? `/colecoes/${data.collection.slug}` : null
              }
            />

            {data.products.length === 0 ? (
              <CollectionEmptyState
                collectionSlug={data.collection.slug}
                hasCategoryFilter={Boolean(data.selectedCategory)}
              />
            ) : (
              <StoreProductsGrid products={data.products} />
            )}
          </div>
        </Container>
      </Section>
    </div>
  );
}