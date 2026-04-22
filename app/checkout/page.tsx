import type { Metadata } from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout | Biscuit_eria",
  description: "Finalize seu pedido na Biscuit_eria.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}