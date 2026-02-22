'use client';

import { FC } from 'react';
import Image from 'next/image';
import Button from './Button';
import Link from 'next/link';
import Badge from './Badge';

interface ProductCardProps {
    name: string;
    price: number;
    slug: string;
    image: string;
    badge?: string;
    linkext?: string;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ProductCard: FC<ProductCardProps> = ({ name, price, slug, image, badge, linkext }) => {
    return (
        <div key={slug}
            className="rounded-3xl border border-[var(--rose-100)] bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between">
            <Link target={linkext && "_blank"} href={linkext || `/loja/${slug}`} className="group block">
                <div className="relative aspect-square w-full">
                <Image
                    src={image}
                    alt={`Foto ${name}`}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"/>
                {badge ? (
                    <div className="absolute left-3 top-3">
                        <Badge border>{badge}</Badge>
                    </div>
                ) : null}
                </div>

                <div className="p-5">
                    <div className="text-sm font-semibold text-zinc-900 line-clamp-2">
                        {name}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[var(--green-500)]">
                        {formatBRL(price)}
                    </div>
                </div>
            </Link>
            {/* Actions */}
            <div className="px-5 pb-5">
                <div className="grid gap-2">
                <Button target={linkext && "_blank"}  href={linkext || `/loja/${slug}`} variant="primary" icon={<span className="text-sm">📦</span>}>
                    Comprar 
                </Button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;