import type { Metadata } from "next";

import ProductCreatePageClient from "@/components/admin/products/ProductCreatePageClient";

export const metadata: Metadata = {
  title: "Novo produto | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewAdminProductPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
          Produtos
        </p>

        <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
          Novo produto
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Cadastre um produto com informações, categorias, coleções e imagens.
        </p>
      </section>

      <ProductCreatePageClient />
    </div>
  );
}