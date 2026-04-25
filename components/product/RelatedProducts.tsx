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
  title?: string;
  subtitle?: string;
  products: RelatedProduct[];
  canAcceptOrders: boolean;
  orderUnavailableReason?: string | null;
}

export default function RelatedProducts({
  title = "Você também pode gostar",
  subtitle = "Veja outros produtos relacionados.",
  products,
  canAcceptOrders,
  orderUnavailableReason = null,
}: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-6">
        <h2 className="font-playfair text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-muted)]">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            productId={product.id}
            name={product.name}
            price={product.priceInCents / 100}
            priceInCents={product.priceInCents}
            slug={product.slug}
            image={product.image}
            badge={product.featured ? "Destaque" : undefined}
            available={product.available}
            canAcceptOrders={canAcceptOrders}
            orderUnavailableReason={orderUnavailableReason}
          />
        ))}
      </div>
    </section>
  );
}