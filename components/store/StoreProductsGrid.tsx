import ProductCard from "@/components/ProductCard";
import type { StoreProductCardData } from "@/lib/server/store";

type StoreProductsGridProps = {
  products: StoreProductCardData[];
  canAcceptOrders: boolean;
  orderUnavailableReason?: string | null;
};

export default function StoreProductsGrid({
  products,
  canAcceptOrders,
  orderUnavailableReason = null,
}: StoreProductsGridProps) {
  return (
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
  );
}