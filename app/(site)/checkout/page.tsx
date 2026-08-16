import type { Metadata } from "next";

import AnnouncementBar from "@/components/AnnouncementBar";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getPublicStoreSettings } from "@/lib/server/public-store-settings";

export const metadata: Metadata = {
  title: "Checkout | Biscuit_eria",
  description: "Envie seu pedido para a Biscuit_eria.",
};

export default async function CheckoutPage() {
  const settings = await getPublicStoreSettings();

  return (
    <>
      <AnnouncementBar />
      <CheckoutPageClient settings={settings} />
    </>
  );
}