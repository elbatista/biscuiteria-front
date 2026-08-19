"use client";

import Image from "next/image";
import Link from "next/link";

import {
  AlertCircle,
  Trash2,
} from "lucide-react";

import QuantitySelector from "@/components/product/QuantitySelector";

import {
  CartItem,
  useCartStore,
} from "@/stores/cart-store";

import {
  formatBRLFromCents,
} from "@/lib/format-price";

type CartLineItemProps = {
  item: CartItem;
};

const FALLBACK_IMAGE =
  "/placeholder.png";

function isValidHex(
  value: string | null
) {
  return Boolean(
    value &&
      /^#[0-9A-Fa-f]{6}$/.test(
        value
      )
  );
}

export default function CartLineItem({
  item,
}: CartLineItemProps) {
  const removeItem =
    useCartStore(
      (state) =>
        state.removeItem
    );

  const setQuantity =
    useCartStore(
      (state) =>
        state.setQuantity
    );

  const setItemColor =
    useCartStore(
      (state) =>
        state.setItemColor
    );

  const colorPending =
    item.requiresColor &&
    !item.selectedColorId;

  return (
    <div
      className={[
        "rounded-3xl border bg-white p-4 sm:p-5",

        colorPending
          ? "border-amber-300"
          : "border-[var(--rose-100)]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/produtos/${item.slug}`}
          className="relative block h-28 w-full overflow-hidden rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-50)] sm:h-28 sm:w-28"
        >
          <Image
            src={
              item.imageUrl ||
              FALLBACK_IMAGE
            }
            alt={`Foto ${item.name}`}
            fill
            className="object-cover"
            sizes="112px"
          />
        </Link>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href={`/produtos/${item.slug}`}
                className="text-base font-semibold text-zinc-900 transition hover:text-[var(--green-500)]"
              >
                {item.name}
              </Link>

              {item.selectedColorName ? (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--rose-50)] px-3 py-1 text-xs font-semibold text-zinc-700">
                  <span
                    className="h-4 w-4 rounded-full border border-zinc-200"
                    style={{
                      backgroundColor:
                        isValidHex(
                          item.selectedColorHex
                        )
                          ? item.selectedColorHex ??
                            "#E4E4E7"
                          : "#E4E4E7",
                    }}
                    aria-hidden="true"
                  />

                  Cor:{" "}
                  {
                    item.selectedColorName
                  }
                </div>
              ) : null}

              <div className="mt-2 text-sm text-[var(--text-muted)]">
                Preço unitário:{" "}
                {formatBRLFromCents(
                  item.priceInCents
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                removeItem(
                  item.key
                )
              }
              className="inline-flex cursor-pointer items-center gap-2 self-start rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />

              Remover
            </button>
          </div>

          {item.requiresColor &&
          item.availableColors
            .length > 0 ? (
            <div
              className={[
                "rounded-2xl border p-3",

                colorPending
                  ? "border-amber-200 bg-amber-50"
                  : "border-[var(--rose-100)] bg-[var(--rose-50)]/40",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                {colorPending ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                ) : null}

                <p
                  className={[
                    "text-xs font-semibold",

                    colorPending
                      ? "text-amber-800"
                      : "text-zinc-800",
                  ].join(" ")}
                >
                  {colorPending
                    ? "Escolha uma cor para continuar"
                    : "Alterar cor"}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {item.availableColors.map(
                  (color) => {
                    const selected =
                      item.selectedColorId ===
                      color.id;

                    const safeHex =
                      isValidHex(
                        color.hex
                      )
                        ? color.hex
                        : "#E4E4E7";

                    return (
                      <button
                        key={
                          color.id
                        }
                        type="button"
                        onClick={() =>
                          setItemColor(
                            item.key,
                            color
                          )
                        }
                        aria-pressed={
                          selected
                        }
                        className={[
                          "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",

                          selected
                            ? "border-[var(--rose-300)] bg-white text-zinc-950 ring-2 ring-[var(--rose-200)]"
                            : "border-[var(--rose-100)] bg-white text-zinc-700 hover:bg-[var(--rose-50)]",
                        ].join(
                          " "
                        )}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-zinc-200 shadow-sm"
                          style={{
                            backgroundColor:
                              safeHex,
                          }}
                          aria-hidden="true"
                        />

                        {
                          color.name
                        }
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <QuantitySelector
              value={
                item.quantity
              }
              onChange={(
                value
              ) =>
                setQuantity(
                  item.key,
                  value
                )
              }
              min={1}
              max={99}
            />

            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                Total do item
              </div>

              <div className="text-lg font-bold text-zinc-900">
                {formatBRLFromCents(
                  item.priceInCents *
                    item.quantity
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}