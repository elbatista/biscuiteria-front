import type { PublicFaqItem } from "@/lib/server/public-faq";

type FaqListProps = {
  items: PublicFaqItem[];
};

export default function FaqList({ items }: FaqListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-6">
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Ainda não há perguntas frequentes cadastradas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <details
          key={item.id}
          className="group rounded-3xl border border-[var(--rose-100)] bg-white p-5 shadow-sm"
        >
          <summary className="cursor-pointer list-none text-base font-semibold text-zinc-900">
            <div className="flex items-start justify-between gap-4">
              <span>{item.question}</span>
              <span className="mt-0.5 text-xl leading-none text-[var(--green-500)] transition group-open:rotate-45">
                +
              </span>
            </div>
          </summary>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}