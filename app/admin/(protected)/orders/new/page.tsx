import type { Metadata } from "next";

import AdminCreateOrderForm from "@/components/admin/orders/AdminCreateOrderForm";

export const metadata: Metadata = {
  title: "Novo pedido | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewAdminOrderPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
          Pedidos
        </p>

        <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
          Novo pedido manual
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Registre manualmente uma venda realizada fora da loja online.
          Depois de criado, o pedido seguirá o mesmo fluxo dos demais pedidos.
        </p>
      </section>

      <AdminCreateOrderForm />
    </div>
  );
}