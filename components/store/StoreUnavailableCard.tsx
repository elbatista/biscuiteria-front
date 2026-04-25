import Link from "next/link";
import { CalendarX, Mail, MessageCircle, Store } from "lucide-react";
import type { PublicStoreContactSettings } from "@/lib/server/public-store-settings";

type StoreUnavailableCardProps = {
  settings: PublicStoreContactSettings;
};

function formatDateBR(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function StoreUnavailableCard({
  settings,
}: StoreUnavailableCardProps) {
  const startsAt = formatDateBR(settings.vacationStartsAt);
  const endsAt = formatDateBR(settings.vacationEndsAt);

  return (
    <div className="rounded-3xl border border-amber-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-100 text-amber-900">
          {settings.vacationActive ? (
            <CalendarX className="h-7 w-7" />
          ) : (
            <Store className="h-7 w-7" />
          )}
        </div>

        <h1 className="mt-5 font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {settings.orderUnavailableTitle ||
            "Loja temporariamente indisponível"}
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {settings.orderUnavailableReason ||
            "No momento não estamos aceitando novos pedidos."}
        </p>

        {settings.vacationActive && startsAt && endsAt ? (
          <p className="mt-3 text-sm font-semibold text-zinc-900">
            Período: {startsAt} a {endsAt}
          </p>
        ) : null}

        <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/loja"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--green-500)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)]"
          >
            Voltar para a loja
          </Link>

          {settings.whatsappUrl ? (
            <Link
              href={settings.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--rose-100)] bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </Link>
          ) : settings.contactEmailUrl ? (
            <Link
              href={settings.contactEmailUrl}
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