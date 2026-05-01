import { FC } from "react";
import Image from "next/image";
import Link from "next/link";
import Badge from "./Badge";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { formatBRL } from "@/lib/format-price";

interface ProductCardProps {
  productId: number;
  name: string;
  price: number;
  priceInCents: number;
  slug: string;
  image?: string | null;
  badge?: string;
  available?: boolean;
  canAcceptOrders?: boolean;
  orderUnavailableReason?: string | null;
}

const FALLBACK_IMAGE = "/placeholder.png";

const ProductCard: FC<ProductCardProps> = ({
  productId,
  name,
  price,
  priceInCents,
  slug,
  image,
  badge,
  available = true,
  canAcceptOrders = true,
  orderUnavailableReason = null,
}) => {
  const href = `/produtos/${slug}`;
  const imageSrc = image || FALLBACK_IMAGE;
  const purchasingDisabled = !available || !canAcceptOrders;

  const unavailableLabel = !available
    ? "Produto indisponível"
    : "Loja pausada";

  const statusText = available
    ? canAcceptOrders
      ? "Disponível"
      : "Compras pausadas"
    : "Indisponível";

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--rose-100)] bg-white shadow-sm transition hover:shadow-md">
      <Link href={href} className="group block">
        <div className="relative aspect-square w-full">
          <Image
            src={imageSrc}
            alt={`Foto ${name}`}
            fill
            unoptimized={imageSrc.startsWith("blob:")}
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {badge ? (
            <div className="absolute left-3 top-3">
              <Badge border>{badge}</Badge>
            </div>
          ) : null}
        </div>

        <div className="p-5">
          <div className="line-clamp-2 text-sm font-semibold text-zinc-900">
            {name}
          </div>

          <div className="mt-2 text-sm font-semibold text-[var(--green-500)]">
            {formatBRL(price)}
          </div>

          <div className="mt-2 text-xs text-[var(--text-muted)]">
            {statusText}
          </div>

          {!canAcceptOrders && available && orderUnavailableReason ? (
            <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-amber-700">
              {orderUnavailableReason}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 px-5 pb-5">
        <AddToCartButton
          productId={productId}
          slug={slug}
          name={name}
          priceInCents={priceInCents}
          imageUrl={imageSrc}
          fullWidth
          disabled={purchasingDisabled}
          disabledLabel={unavailableLabel}
        />

        <AddToCartButton
          productId={productId}
          slug={slug}
          name={name}
          priceInCents={priceInCents}
          imageUrl={imageSrc}
          fullWidth
          redirectToCart
          disabled={purchasingDisabled}
          disabledLabel={unavailableLabel}
        >
          Comprar agora
        </AddToCartButton>
      </div>
    </div>
  );
};

export default ProductCard;