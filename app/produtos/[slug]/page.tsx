import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/components/Container";
import ProductDetailsPanel from "@/components/product/ProductDetailsPanel";
import ProductGallery from "@/components/product/ProductGallery";
import RelatedProducts from "@/components/product/RelatedProducts";
import {
  getRelatedStoreProducts,
  getStoreProductBySlug,
} from "@/lib/server/products";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";
import { connection } from "next/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  return {
    title: `${product.name} | Biscuit_eria`,
    description:
      product.shortDescription || product.description || product.name,
    openGraph: {
      title: product.name,
      description:
        product.shortDescription || product.description || product.name,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  const [product, contact] = await Promise.all([
    getStoreProductBySlug(slug),
    getPublicStoreContactSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const related = await getRelatedStoreProducts(product.id);

  const primaryCollection = product.collections[0] ?? null;
  const primaryCategory = product.categories[0] ?? null;

  return (
    <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Container>
        <div className="py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]"
          >
            <Link
              href="/"
              className="cursor-pointer transition hover:text-zinc-900 hover:underline"
            >
              Início
            </Link>

            <span>/</span>

            <Link
              href="/loja"
              className="cursor-pointer transition hover:text-zinc-900 hover:underline"
            >
              Loja
            </Link>

            {primaryCollection ? (
              <>
                <span>/</span>
                <Link
                  href={`/colecoes/${primaryCollection.slug}`}
                  className="cursor-pointer transition hover:text-zinc-900 hover:underline"
                >
                  {primaryCollection.title}
                </Link>
              </>
            ) : primaryCategory ? (
              <>
                <span>/</span>
                <Link
                  href={`/loja?categoria=${primaryCategory.slug}`}
                  className="cursor-pointer transition hover:text-zinc-900 hover:underline"
                >
                  {primaryCategory.name}
                </Link>
              </>
            ) : null}

            <span>/</span>

            <span className="text-zinc-900">{product.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            <ProductGallery
              productName={product.name}
              images={product.images}
            />

            <ProductDetailsPanel
              productId={product.id}
              name={product.name}
              slug={product.slug}
              shortDescription={product.shortDescription}
              description={product.description}
              priceInCents={product.priceInCents}
              compareAtPriceInCents={product.compareAtPriceInCents}
              featured={product.featured}
              imageUrl={product.images[0]?.thumbUrl ?? product.images[0]?.url ?? null}
              canAcceptOrders={contact.canAcceptOrders}
              orderUnavailableReason={contact.orderUnavailableReason}
              primaryCollection={
                primaryCollection
                  ? {
                      title: primaryCollection.title,
                      slug: primaryCollection.slug,
                    }
                  : null
              }
              categories={product.categories.map((category) => ({
                name: category.name,
                slug: category.slug,
              }))}
            />
          </div>

          <RelatedProducts
            title={related.title}
            subtitle={related.subtitle}
            products={related.products}
            canAcceptOrders={contact.canAcceptOrders}
            orderUnavailableReason={contact.orderUnavailableReason}
          />
        </div>
      </Container>
    </main>
  );
}