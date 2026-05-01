import type { Metadata } from "next";

import StoreSettingsForm from "@/components/admin/settings/StoreSettingsForm";

export const metadata: Metadata = {
  title: "Funcionamento da loja | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminStoreSettingsPage() {
  return <StoreSettingsForm />;
}