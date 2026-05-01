import type { Metadata } from "next";

import SettingsHomeClient from "@/components/admin/settings/SettingsHomeClient";

export const metadata: Metadata = {
  title: "Configurações | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSettingsPage() {
  return <SettingsHomeClient />;
}