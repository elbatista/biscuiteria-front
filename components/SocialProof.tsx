
import Image from "next/image";

type ProofImage = { id: string; imageUrl: string; alt: string };
type Testimonial = { id: string; name: string; text: string; source?: string };

export default function SocialProof({
  proofImages,
  testimonials,
}: {
  proofImages: ProofImage[];
  testimonials: Testimonial[];
}) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Prova social
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Produtos entregues + mensagens reais de clientes.
            </p>
          </div>
        </div>

        {/* Galeria */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {proofImages.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
            >
              <Image
                src={img.imageUrl}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>

        {/* Depoimentos */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {t.name}
              </div>
              <p className="mt-2 text-sm text-neutral-700">“{t.text}”</p>
              {t.source ? (
                <div className="mt-3 text-xs text-neutral-500">{t.source}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
