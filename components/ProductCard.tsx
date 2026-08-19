"use client";

import {
  FC,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Check,
  ShoppingCart,
} from "lucide-react";

import Badge from "./Badge";

import {
  type CartColorOption,
  useCartStore,
} from "@/stores/cart-store";

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

  orderUnavailableReason?:
    | string
    | null;

  colors?: CartColorOption[];
}

const FALLBACK_IMAGE =
  "/placeholder.png";

const ProductCard: FC<
  ProductCardProps
> = ({
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
  colors = [],
}) => {
  const href =
    `/produtos/${slug}`;

  const imageSrc =
    image || FALLBACK_IMAGE;

  const addItem =
    useCartStore(
      (state) => state.addItem
    );

  const [added, setAdded] =
    useState(false);

  const statusText =
    available
      ? canAcceptOrders
        ? "Disponível"
        : "Compras pausadas"
      : "Indisponível";

  const quickAddDisabled =
    !available ||
    !canAcceptOrders;

  const quickAddLabel =
    !available
      ? "Produto indisponível"
      : !canAcceptOrders
        ? "Compras pausadas"
        : added
          ? "Adicionado ao carrinho"
          : "Adicionar ao carrinho";

  function handleQuickAdd() {
    if (quickAddDisabled) {
      return;
    }

    addItem({
      productId,
      slug,
      name,
      priceInCents,

      imageUrl:
        imageSrc,

      quantity: 1,

      /*
       * Se houver cores,
       * enviamos as opções ao carrinho,
       * mas não selecionamos nenhuma.
       */
      availableColors:
        colors,

      selectedColorId:
        null,

      selectedColorName:
        null,

      selectedColorHex:
        null,
    });

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--rose-100)] bg-white shadow-sm transition hover:shadow-md">
      <Link
        href={href}
        className="group block"
      >
        <div className="relative aspect-square w-full">
          <Image
            src={imageSrc}
            alt={`Foto ${name}`}
            fill
            unoptimized={
              imageSrc.startsWith(
                "blob:"
              )
            }
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {badge ? (
            <div className="absolute left-3 top-3">
              <Badge border>
                {badge}
              </Badge>
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

          {!canAcceptOrders &&
          available &&
          orderUnavailableReason ? (
            <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-amber-700">
              {
                orderUnavailableReason
              }
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex gap-2 px-5 pb-5">
        <Link
          href={href}
          className={[
            "inline-flex min-w-0 flex-1 items-center justify-center rounded-2xl px-4 py-3 text-center text-sm font-semibold shadow-sm transition",

            available &&
            canAcceptOrders
              ? "bg-[var(--green-500)] text-white hover:bg-[var(--green-300)]"
              : "border border-[var(--rose-100)] bg-white text-zinc-900 hover:bg-[var(--rose-50)]",
          ].join(" ")}
        >
          Ver produto
        </Link>

        <button
          type="button"
          onClick={
            handleQuickAdd
          }
          disabled={
            quickAddDisabled
          }
          title={
            quickAddLabel
          }
          aria-label={
            quickAddLabel
          }
          className={[
            "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition",

            quickAddDisabled
              ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
              : added
                ? "cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500"
                : "cursor-pointer bg-[var(--green-500)] text-white hover:bg-[var(--green-300)]",
          ].join(" ")}
        >
          {added ? (
            <Check className="h-4 w-4" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;