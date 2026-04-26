import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";

export const metadata: Metadata = {
  title: "Checkout | Biscuit_eria",
  description: "Finalize seu pedido na Biscuit_eria.",
};

export default async function CheckoutPage() {
  const contact = await getPublicStoreContactSettings();

  return <CheckoutPageClient contact={contact} />;
}