import type { Metadata } from "next";

import CollectionsPageClient from "@/components/admin/collections/CollectionsPageClient";

export const metadata: Metadata = {
  title: "Coleções | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCollectionsPage() {
  return <CollectionsPageClient />;
}