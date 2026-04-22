import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDetailsPanel from "@/components/product/ProductDetailsPanel";
import RelatedProducts from "@/components/product/RelatedProducts";
import {
  getRelatedStoreProducts,
  getStoreProductBySlug,
} from "@/lib/server/products";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedStoreProducts(product.id);

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
            />
          </div>

          <RelatedProducts products={relatedProducts} />
        </div>
      </Container>
    </main>
  );
}