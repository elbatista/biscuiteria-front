import ProductCard from "@/components/ProductCard";

interface RelatedProduct {
  id: number;
  slug: string;
  name: string;
  priceInCents: number;
  featured: boolean;
  image: string | null;
  available: boolean;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export default function RelatedProducts({
  products,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          Você também pode gostar
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)]">
          Veja outros produtos da coleção.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.priceInCents / 100}
            slug={product.slug}
            image={product.image}
            badge={product.featured ? "Destaque" : undefined}
            available={product.available}
          />
        ))}
      </div>
    </section>
  );
}