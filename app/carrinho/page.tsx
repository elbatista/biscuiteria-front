import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Carrinho | Biscuit_eria",
  description: "Veja os produtos adicionados ao carrinho.",
};

export default async function CartPage() {
  await connection();
  const contact = await getPublicStoreContactSettings();

  return <CartPageClient contact={contact} />;
}