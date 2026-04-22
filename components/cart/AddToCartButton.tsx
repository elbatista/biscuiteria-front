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
  fullWidth?: boolean;
  redirectToCart?: boolean;
  children?: React.ReactNode;
};

export default function AddToCartButton({
  productId,
  slug,
  name,
  priceInCents,
  imageUrl = null,
  quantity = 1,
  fullWidth = false,
  redirectToCart = false,
  children,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function handleAddToCart() {
    addItem({
      productId,
      slug,
      name,
      priceInCents,
      imageUrl,
      quantity,
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
      className={[
        "inline-flex cursor-pointer items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition shadow-sm",
        redirectToCart
          ? "bg-[var(--rose-300)] text-white hover:bg-[var(--rose-500)]"
          : added
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "bg-[var(--green-500)] text-white hover:bg-[var(--green-300)]",
        fullWidth ? "w-full" : "",
      ].join(" ")}
    >
      {redirectToCart ? (
  <CreditCard className="mr-2 h-4 w-4" />
) : (
  <ShoppingCart className="mr-2 h-4 w-4" />
)}

{children ? children : added ? "Adicionado" : "Adicionar ao carrinho"}
    </button>
  );
}