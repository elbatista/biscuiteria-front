import type { Metadata } from "next";

import ShippingOriginSettingsForm from "@/components/admin/settings/ShippingOriginSettingsForm";

export const metadata: Metadata = {
  title: "Origem do frete | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminShippingOriginSettingsPage() {
  return <ShippingOriginSettingsForm />;
}