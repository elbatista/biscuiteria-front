import Button from "@/components/Button";
import Badge from "@/components/Badge";

type StoreHeroProps = {
  whatsappHref?: string;
  instagramHref?: string;
};

export default function StoreHero({
  whatsappHref,
  instagramHref,
}: StoreHeroProps) {
  return (
    <div className="rounded-3xl border border-[var(--rose-100)] bg-white/80 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <Badge>Loja</Badge>

          <h1 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Explore produtos por categorias e coleções
          </h1>

          <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            Encontre presentes, novidades e peças feitas à mão para deixar seu
            chimarrão ainda mais especial.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button target="_blank" href={whatsappHref} variant="primary">
            Falar no WhatsApp
          </Button>
          <Button target="_blank" href={instagramHref} variant="secondary">
            Ver Instagram
          </Button>
        </div>
      </div>
    </div>
  );
}