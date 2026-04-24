import Image from "next/image";
import Link from "next/link";

import Badge from "@/components/Badge";

type CollectionHeroProps = {
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
};

export default function CollectionHero({
  title,
  description,
  coverImageUrl,
  isFeatured,
}: CollectionHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-[var(--rose-100)] bg-zinc-900">
      <div className="relative min-h-[320px] sm:min-h-[380px] lg:min-h-[440px]">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : null}

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[320px] max-w-7xl items-end px-6 py-10 sm:min-h-[380px] sm:px-8 sm:py-12 lg:min-h-[440px] lg:px-10 lg:py-16">
          <div className="max-w-3xl space-y-4 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Coleção</Badge>
              {isFeatured ? <Badge>Destaque</Badge> : null}
            </div>

            <h1 className="font-playfair text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">
              {description ||
                "Explore os produtos desta coleção e descubra peças que combinam entre si por estilo, ocasião ou proposta."}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/loja"
                className="inline-flex items-center rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Ver toda a loja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}