import type { Metadata } from "next";

import AboutSettingsForm from "@/components/admin/settings/AboutSettingsForm";

export const metadata: Metadata = {
  title: "Sobre a autora | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAboutSettingsPage() {
  return <AboutSettingsForm />;
}
