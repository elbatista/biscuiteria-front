// components/faq/FaqPreview.tsx

import Link from "next/link";
import FaqList from "@/components/faq/FaqList";
import type { PublicFaqItem } from "@/lib/server/public-faq";

type FaqPreviewProps = {
  items: PublicFaqItem[];
  title?: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
};

export default function FaqPreview({
  items,
  title = "Dúvidas frequentes",
  subtitle = "Veja respostas rápidas para as perguntas mais comuns.",
  href = "/faq",
  ctaLabel = "Ver todas as perguntas",
}: FaqPreviewProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--green-500)]">
          FAQ
        </p>

        <h2 className="mt-2 font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {subtitle}
        </p>
      </div>

      <FaqList items={items} />

      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-[var(--rose-50)]"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}