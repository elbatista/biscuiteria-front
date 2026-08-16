"use client";

import { useMemo, useState } from "react";
import QuantitySelector from "./QuantitySelector";
import ShareButtons from "./ShareButton";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductContextLinks from "./ProductContextLinks";

type ProductColorOption = {
  id: number;
  name: string;
  hex: string;
};

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
  canAcceptOrders: boolean;
  orderUnavailableReason?: string | null;
  colors?: ProductColorOption[];
  primaryCollection?: {
    title: string;
    slug: string;
  } | null;
  categories?: Array<{
    name: string;
    slug: string;
  }>;
}

function formatBRL(valueInCents: number) {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isValidHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
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
  canAcceptOrders,
  orderUnavailableReason = null,
  colors = [],
  primaryCollection = null,
  categories = [],
}: ProductDetailsPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

  const selectedColor = useMemo(() => {
    return colors.find((color) => color.id === selectedColorId) ?? null;
  }, [colors, selectedColorId]);

  const requiresColor = colors.length > 0;
  const colorSelectionMissing = requiresColor && !selectedColor;
  const purchaseDisabled = !canAcceptOrders || colorSelectionMissing;
  const purchaseDisabledLabel = !canAcceptOrders
    ? "Loja pausada"
    : colorSelectionMissing
      ? "Escolha uma cor"
      : "Indisponível no momento";

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

      <ProductContextLinks
        collection={primaryCollection}
        categories={categories}
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <div className="text-3xl font-bold text-zinc-900">
            {formatBRL(priceInCents)}
          </div>

          {compareAtPriceInCents ? (
            <div className="mt-1 text-sm text-[var(--text-muted)] line-through">
              {formatBRL(compareAtPriceInCents)}
            </div>
          ) : null}
        </div>

        <div className="scale-70 sm:shrink-0 sm:scale-85">
          <ShareButtons title={`Confira este produto: ${name}`} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={[
            "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
            canAcceptOrders
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          {canAcceptOrders ? "Disponível" : "Compras pausadas"}
        </span>
      </div>

      {!canAcceptOrders ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          {orderUnavailableReason ||
            "No momento não estamos aceitando novos pedidos."}
        </div>
      ) : null}

      {colors.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-[var(--rose-100)] bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Escolha a cor
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                Selecione uma opção para adicionar o produto ao carrinho.
              </p>
            </div>

            {selectedColor ? (
              <div className="text-right text-xs text-[var(--text-muted)]">
                Selecionada
                <div className="mt-1 font-semibold text-zinc-900">
                  {selectedColor.name}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {colors.map((color) => {
              const selected = color.id === selectedColorId;
              const safeHex = isValidHex(color.hex) ? color.hex : "#E4E4E7";

              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setSelectedColorId(color.id)}
                  className={[
                    "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                    selected
                      ? "border-[var(--rose-300)] bg-[var(--rose-50)] text-zinc-950 ring-2 ring-[var(--rose-200)]"
                      : "border-[var(--rose-100)] bg-white text-zinc-700 hover:bg-[var(--rose-50)]",
                  ].join(" ")}
                  aria-pressed={selected}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-zinc-200 shadow-sm"
                    style={{ backgroundColor: safeHex }}
                    aria-hidden="true"
                  />
                  {color.name}
                </button>
              );
            })}
          </div>

          {colorSelectionMissing ? (
            <p className="mt-3 text-xs font-medium text-amber-700">
              Escolha uma cor antes de comprar.
            </p>
          ) : null}
        </section>
      ) : null}

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
            selectedColorId={selectedColor?.id ?? null}
            selectedColorName={selectedColor?.name ?? null}
            selectedColorHex={selectedColor?.hex ?? null}
            fullWidth
            disabled={purchaseDisabled}
            disabledLabel={purchaseDisabledLabel}
          >
            Adicionar ao carrinho
          </AddToCartButton>

          <AddToCartButton
            productId={productId}
            slug={slug}
            name={name}
            priceInCents={priceInCents}
            imageUrl={imageUrl}
            quantity={quantity}
            selectedColorId={selectedColor?.id ?? null}
            selectedColorName={selectedColor?.name ?? null}
            selectedColorHex={selectedColor?.hex ?? null}
            fullWidth
            redirectToCart
            disabled={purchaseDisabled}
            disabledLabel={purchaseDisabledLabel}
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