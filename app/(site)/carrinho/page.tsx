import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { getPublicStoreSettings } from "@/lib/server/public-store-settings";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata: Metadata = {
  title: "Carrinho | Biscuit_eria",
  description: "Veja os produtos adicionados ao carrinho.",
};

export default async function CartPage() {
  const settings = await getPublicStoreSettings();
  return (
    <>
    <AnnouncementBar/>
    <CartPageClient settings={settings} />
    </>
);
}