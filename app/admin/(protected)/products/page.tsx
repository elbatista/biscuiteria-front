import type { Metadata } from "next";

import ProductsPageClient from "@/components/admin/products/ProductsPageClient";

export const metadata: Metadata = {
  title: "Produtos | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminProductsPage() {
  return <ProductsPageClient />;
}