"use client";

import ProductCard from "@/components/ProductCard";

type ProductCardPreviewProps = {
  productId?: number;
  name: string;
  slug: string;
  priceInCents: number;
  imageUrl?: string | null;
  active: boolean;
  featured: boolean;
};

export default function ProductCardPreview({
  productId = 0,
  name,
  slug,
  priceInCents,
  imageUrl,
  active,
  featured,
}: ProductCardPreviewProps) {
  const safeName = name.trim() || "Nome do produto";
  const safeSlug = slug.trim() || "produto";

  return (
    <aside className="self-start xl:sticky xl:top-24">
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--rose-500)]">
            Prévia
          </p>

          <h2 className="mt-2 text-lg font-semibold text-zinc-950">
            Card público
          </h2>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Esta prévia usa o mesmo componente exibido na loja pública.
          </p>
        </div>

        <div className="pointer-events-none select-none">
          <ProductCard
            productId={productId}
            name={safeName}
            slug={safeSlug}
            price={priceInCents / 100}
            priceInCents={priceInCents}
            image={imageUrl || "/placeholder.png"}
            badge={featured ? "Destaque" : undefined}
            available={active}
            canAcceptOrders
            orderUnavailableReason={null}
          />
        </div>
      </div>
    </aside>
  );
}