import type { Metadata } from "next";

import AnnouncementSettingsForm from "@/components/admin/settings/AnnouncementSettingsForm";

export const metadata: Metadata = {
  title: "Aviso do site | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAnnouncementSettingsPage() {
  return <AnnouncementSettingsForm />;
}