"use client";

import Link from "next/link";
import { Megaphone, PackageCheck, Settings, Truck } from "lucide-react";

const settingsItems = [
  {
    title: "Funcionamento da loja",
    description: "Abrir ou fechar a loja e configurar mensagem de loja fechada.",
    href: "/admin/settings/store",
    icon: PackageCheck,
  },
  {
    title: "Aviso do site",
    description: "Gerenciar a barra de anúncio exibida no topo da loja.",
    href: "/admin/settings/announcement",
    icon: Megaphone,
  },
  {
    title: "Origem do frete",
    description: "Configurar o endereço usado como origem para cálculo de frete.",
    href: "/admin/settings/shipping-origin",
    icon: Truck,
  },
];

export default function SettingsHomeClient() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
            Configurações
          </p>

          <h1 className="font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Configurações da loja
          </h1>

          <p className="text-sm leading-6 text-zinc-500 sm:text-base">
            Gerencie funcionamento, avisos e dados operacionais da Biscuit_eria.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-[var(--rose-500)]">
                <Icon className="h-5 w-5" />
              </div>

              <div className="mt-5 space-y-2">
                <h2 className="text-lg font-semibold text-zinc-950">
                  {item.title}
                </h2>

                <p className="text-sm leading-6 text-zinc-500">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 text-sm font-semibold text-zinc-300 transition group-hover:text-[var(--rose-500)]">
                Abrir →
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
            <Settings className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Outras configurações
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              O FAQ já está disponível em{" "}
              <Link
                href="/admin/settings/faq"
                className="font-semibold text-[var(--rose-500)] hover:underline"
              >
                Configurações → FAQ
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}