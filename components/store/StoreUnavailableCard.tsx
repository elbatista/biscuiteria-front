import Link from "next/link";
import { Mail, MessageCircle, Store } from "lucide-react";
import type { PublicStoreSettings } from "@/lib/server/public-store-settings";

type StoreUnavailableCardProps = {
  settings: PublicStoreSettings;
};

export default function StoreUnavailableCard({
  settings,
}: StoreUnavailableCardProps) {

  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const contactEmailUrl = process.env.NEXT_PUBLIC_CONTACT_EMAIL
    ? "mailto:" + process.env.NEXT_PUBLIC_CONTACT_EMAIL
    : null;

  return (
    <div className="rounded-3xl border border-amber-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-900">
            <Store className="h-7 w-7" />
        </div>

        <h1 className="mt-5 font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {settings.orderUnavailableTitle ||
            "Loja temporariamente indisponível"}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {settings.orderUnavailableReason ||
            "No momento não estamos aceitando novos pedidos."}
        </p>

        <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/loja"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--green-500)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)]"
          >
            Voltar para a loja
          </Link>

          {whatsappUrl ? (
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--rose-100)] bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </Link>
          ) : contactEmailUrl ? (
            <Link
              href={contactEmailUrl}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--rose-100)] bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
            >
              <Mail className="h-4 w-4" />
              Enviar e-mail
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}