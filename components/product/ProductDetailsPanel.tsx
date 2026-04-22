"use client";

import { useMemo, useState } from "react";
import QuantitySelector from "./QuantitySelector";
import ShareButtons from "./ShareButton";
import AddToCartButton from "@/components/cart/AddToCartButton";

interface ProductDetailsPanelProps {
  productId: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  featured: boolean;
  imageUrl?: string | null;
}

function formatBRL(valueInCents: number) {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProductDetailsPanel({
  productId,
  name,
  slug,
  shortDescription,
  description,
  priceInCents,
  compareAtPriceInCents,
  featured,
  imageUrl = null,
}: ProductDetailsPanelProps) {
  const [quantity, setQuantity] = useState(1);

  const whatsappHref = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_WHATSAPP_URL || "";
    if (!base) return "#";

    const separator = base.includes("?") ? "&" : "?";
    const message = encodeURIComponent(
      `Olá! Tenho interesse em ${quantity} unidade(s) do produto "${name}" (${slug}).`
    );

    return `${base}${separator}text=${message}`;
  }, [name, slug, quantity]);

  return (
    <div className="flex flex-col justify-start">
      {featured ? (
        <div className="mb-3 inline-flex w-fit rounded-full border border-[var(--rose-100)] bg-white px-3 py-1 text-sm font-medium text-zinc-900">
          Destaque
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {name}
        </h1>
      </div>

      {shortDescription ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {shortDescription}
        </p>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <div className="text-3xl font-bold text-zinc-900">
            {formatBRL(priceInCents)}
          </div>

          {compareAtPriceInCents ? (
            <div className="text-lg text-zinc-400 line-through">
              {formatBRL(compareAtPriceInCents)}
            </div>
          ) : null}
        </div>

        <div className="scale-70 sm:scale-85 sm:shrink-0">
          <ShareButtons title={`Confira este produto: ${name}`} />
        </div>
      </div>

      <div className="mt-4">
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          Disponível
        </span>
      </div>

      <div className="mt-6">
        <QuantitySelector value={quantity} onChange={setQuantity} max={100} />
      </div>

      <div className="mt-6 space-y-3">
       

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
           
          <AddToCartButton
            productId={productId}
            slug={slug}
            name={name}
            priceInCents={priceInCents}
            imageUrl={imageUrl}
            quantity={quantity}
            fullWidth>
            Adicionar ao carrinho
          </AddToCartButton>
          <AddToCartButton
            productId={productId}
            slug={slug}
            name={name}
            priceInCents={priceInCents}
            imageUrl={imageUrl}
            quantity={quantity}
            fullWidth
            redirectToCart
          >
            Comprar agora
          </AddToCartButton>

        </div>
      </div>

      {description ? (
        <div className="mt-8 rounded-2xl border border-[var(--rose-100)] bg-white p-5">
          <h2 className="text-lg font-semibold text-zinc-900">
            Descrição do produto
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
            {description}
          </p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--rose-100)] bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">
            Produção artesanal
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            Peças feitas com cuidado nos detalhes.
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--rose-100)] bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">
            Atendimento direto
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            Tire dúvidas e combine pedidos pelo WhatsApp.
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--rose-100)] bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">
            Personalização
          </div>
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            Consulte opções especiais sob medida.
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--rose-100)] bg-white p-5">
        <h2 className="text-xs font-semibold text-zinc-900">Envio e prazo</h2>

        <div className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--text-muted)]">
          <p>
            O prazo de envio é informado no atendimento, de acordo com a
            disponibilidade da peça e a quantidade desejada.
          </p>
          <p>
            Produtos personalizados podem precisar de um tempo extra de
            produção.
          </p>
          <p>
            Para confirmar prazo e entrega, fale pelo WhatsApp antes de fechar o
            pedido.
          </p>
        </div>
      </div>
    </div>
  );
}