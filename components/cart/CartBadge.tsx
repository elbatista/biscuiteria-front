"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";

export default function CartBadge() {
  const count = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/carrinho"
      aria-label="Abrir carrinho"
      className="relative inline-flex items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white/70 p-3 text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
    >
      <ShoppingBag className="h-5 w-5" />

      <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--green-500)] px-1.5 text-[10px] font-bold text-white">
        {mounted ? count : 0}
      </span>
    </Link>
  );
}