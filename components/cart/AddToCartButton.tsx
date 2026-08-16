"use client";

import { useState } from "react";
import { CreditCard, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useRouter } from "next/navigation";

type AddToCartButtonProps = {
  productId: number;
  slug: string;
  name: string;
  priceInCents: number;
  imageUrl?: string | null;
  quantity?: number;
  selectedColorId?: number | null;
  selectedColorName?: string | null;
  selectedColorHex?: string | null;
  fullWidth?: boolean;
  redirectToCart?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
};

export default function AddToCartButton({
  productId,
  slug,
  name,
  priceInCents,
  imageUrl = null,
  quantity = 1,
  selectedColorId = null,
  selectedColorName = null,
  selectedColorHex = null,
  fullWidth = false,
  redirectToCart = false,
  children,
  disabled = false,
  disabledLabel = "Indisponível no momento",
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function handleAddToCart() {
    if (disabled) return;

    addItem({
      productId,
      slug,
      name,
      priceInCents,
      imageUrl,
      quantity,
      selectedColorId,
      selectedColorName,
      selectedColorHex,
    });

    if (redirectToCart) {
      router.push("/carrinho");
      return;
    }

    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 1500);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={disabled}
      title={disabled ? disabledLabel : undefined}
      className={[
        "inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold shadow-sm transition",
        disabled
          ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
          : redirectToCart
            ? "cursor-pointer bg-[var(--rose-300)] text-white hover:bg-[var(--rose-500)]"
            : added
              ? "cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500"
              : "cursor-pointer bg-[var(--green-500)] text-white hover:bg-[var(--green-300)]",
        fullWidth ? "w-full" : "",
      ].join(" ")}
    >
      {redirectToCart ? (
        <CreditCard className="mr-2 h-4 w-4" />
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}

      {disabled
        ? disabledLabel
        : children
          ? children
          : added
            ? "Adicionado"
            : "Adicionar ao carrinho"}
    </button>
  );
}