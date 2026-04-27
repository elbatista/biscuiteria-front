import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getPublicStoreSettings } from "@/lib/server/public-store-settings";
import AnnouncementBar from "@/components/AnnouncementBar";

export const metadata: Metadata = {
  title: "Checkout | Biscuit_eria",
  description: "Finalize seu pedido na Biscuit_eria.",
};

export default async function CheckoutPage() {
  const settings = await getPublicStoreSettings()
  return (
    <>
    <AnnouncementBar/>
    <CheckoutPageClient settings={settings} />
    </>
  );
}