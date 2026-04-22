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
}) => {
  const href = `/produtos/${slug}`;
  const imageSrc = image || FALLBACK_IMAGE;

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--rose-100)] bg-white shadow-sm transition hover:shadow-md">
      <Link href={href} className="group block">
        <div className="relative aspect-square w-full">
          <Image
            src={imageSrc}
            alt={`Foto ${name}`}
            fill
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
            {available ? "Disponível" : "Indisponível"}
          </div>
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
        />

        <AddToCartButton
          productId={productId}
          slug={slug}
          name={name}
          priceInCents={priceInCents}
          imageUrl={imageSrc}
          fullWidth
          redirectToCart
        >
          Comprar agora
        </AddToCartButton>

        {/* <Link
          href={href}
          className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
        >
          Ver produto
        </Link> */}
      </div>
    </div>
  );
};

export default ProductCard;