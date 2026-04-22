import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Carrinho | Biscuit_eria",
  description: "Veja os produtos adicionados ao carrinho.",
};

export default function CartPage() {
  return <CartPageClient />;
}