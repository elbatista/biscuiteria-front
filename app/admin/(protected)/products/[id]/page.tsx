import type { Metadata } from "next";

import ProductEditPageClient from "@/components/admin/products/ProductEditPageClient";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar produto | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
          Produtos
        </p>

        <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
          Editar produto
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Atualize informações, categorias, coleções, status e imagens.
        </p>
      </section>

      <ProductEditPageClient productId={id} />
    </div>
  );
}