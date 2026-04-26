import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Carrinho | Biscuit_eria",
  description: "Veja os produtos adicionados ao carrinho.",
};

export default async function CartPage() {
  const contact = await getPublicStoreContactSettings();

  return <CartPageClient contact={contact} />;
}