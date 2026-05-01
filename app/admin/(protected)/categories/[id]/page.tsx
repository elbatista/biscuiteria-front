import type { Metadata } from "next";

import CategoryEditPageClient from "@/components/admin/categories/CategoryEditPageClient";

type AdminCategoryEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar categoria | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCategoryEditPage({
  params,
}: AdminCategoryEditPageProps) {
  const { id } = await params;

  return <CategoryEditPageClient categoryId={id} />;
}