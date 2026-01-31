import Image from "next/image";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number; // em reais
  imageUrl: string;
  href: string;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="text-sm font-semibold text-neutral-900">
            {formatBRL(product.price)}
          </div>
        </div>

        <Link
          href={product.href}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Comprar
        </Link>
      </div>
    </div>
  );
}
