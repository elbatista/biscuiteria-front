import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import type { PublicStoreContactSettings } from "@/lib/server/public-store-settings";

type ContactSupportCardProps = {
  contact: PublicStoreContactSettings;
  title?: string;
  description?: string;
  compact?: boolean;
};

export default function ContactSupportCard({
  contact,
  title = "Precisa de ajuda?",
  description = "Se tiver dúvidas sobre seu pedido, fale conosco.",
  compact = false,
}: ContactSupportCardProps) {
  const hasContact = contact.whatsappUrl || contact.contactEmailUrl;

  if (!hasContact) {
    return null;
  }

  return (
    <div
      className={[
        "rounded-3xl border border-[var(--rose-100)] bg-white p-5",
        compact ? "" : "sm:p-6",
      ].join(" ")}
    >
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>

      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
        {description}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {contact.whatsappUrl ? (
          <Link
            href={contact.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--green-300)]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Link>
        ) : null}

        {contact.contactEmailUrl ? (
          <Link
            href={contact.contactEmailUrl}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--rose-100)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
          >
            <Mail className="h-4 w-4" />
            E-mail
          </Link>
        ) : null}
      </div>
    </div>
  );
}