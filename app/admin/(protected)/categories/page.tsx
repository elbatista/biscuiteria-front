import type { Metadata } from "next";

import CategoriesPageClient from "@/components/admin/categories/CategoriesPageClient";

export const metadata: Metadata = {
  title: "Categorias | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCategoriesPage() {
  return <CategoriesPageClient />;
}