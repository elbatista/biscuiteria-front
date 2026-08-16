"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import type { ProductColorFormValue } from "@/components/admin/products/types";

type ProductColorsEditorProps = {
  colors: ProductColorFormValue[];
  disabled?: boolean;
  onChange: (colors: ProductColorFormValue[]) => void;
};

const DEFAULT_HEX = "#F4A7B9";

function normalizeHex(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  return withHash.toUpperCase();
}

function renumberColors(colors: ProductColorFormValue[]) {
  return colors.map((color, index) => ({
    ...color,
    sortOrder: index + 1,
  }));
}

export default function ProductColorsEditor({
  colors,
  disabled = false,
  onChange,
}: ProductColorsEditorProps) {
  function addColor() {
    onChange(
      renumberColors([
        ...colors,
        {
          name: "",
          hex: DEFAULT_HEX,
          active: true,
          sortOrder: colors.length + 1,
        },
      ])
    );
  }

  function updateColor(
    index: number,
    patch: Partial<Omit<ProductColorFormValue, "sortOrder">>
  ) {
    onChange(
      renumberColors(
        colors.map((color, colorIndex) =>
          colorIndex === index ? { ...color, ...patch } : color
        )
      )
    );
  }

  function removeColor(index: number) {
    onChange(
      renumberColors(colors.filter((_, colorIndex) => colorIndex !== index))
    );
  }

  function moveColor(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (!colors[targetIndex]) {
      return;
    }

    const nextColors = [...colors];
    const [removed] = nextColors.splice(index, 1);
    nextColors.splice(targetIndex, 0, removed);

    onChange(renumberColors(nextColors));
  }

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-800">
            Cores disponíveis
          </p>

          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Opcional. Se nenhuma cor for cadastrada, o produto será comprado sem
            seleção de cor.
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={addColor}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Adicionar cor
        </button>
      </div>

      {colors.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-center text-sm text-zinc-500">
          Nenhuma cor cadastrada para este produto.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {colors.map((color, index) => {
            const normalizedHex = normalizeHex(color.hex) || DEFAULT_HEX;
            const isFirst = index === 0;
            const isLast = index === colors.length - 1;

            return (
              <div
                key={`${color.id ?? "new"}-${index}`}
                className="rounded-2xl border border-zinc-200 bg-white p-3"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_auto] lg:items-end">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Nome da cor
                    </label>

                    <input
                      type="text"
                      disabled={disabled}
                      value={color.name}
                      onChange={(event) =>
                        updateColor(index, { name: event.target.value })
                      }
                      placeholder="Ex: Rosa claro"
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Cor
                    </label>

                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 focus-within:border-[var(--rose-500)] focus-within:ring-4 focus-within:ring-rose-100">
                      <input
                        type="color"
                        disabled={disabled}
                        value={
                          /^#[0-9A-Fa-f]{6}$/.test(normalizedHex)
                            ? normalizedHex
                            : DEFAULT_HEX
                        }
                        onChange={(event) =>
                          updateColor(index, {
                            hex: event.target.value.toUpperCase(),
                          })
                        }
                        className="h-8 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label="Selecionar cor"
                      />

                      <input
                        type="text"
                        disabled={disabled}
                        value={color.hex}
                        onChange={(event) =>
                          updateColor(index, {
                            hex: normalizeHex(event.target.value),
                          })
                        }
                        placeholder="#F4A7B9"
                        className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-700 outline-none disabled:cursor-not-allowed disabled:text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={color.active}
                        onChange={(event) =>
                          updateColor(index, { active: event.target.checked })
                        }
                        className="h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      Ativa
                    </label>

                    <button
                      type="button"
                      disabled={disabled || isFirst}
                      onClick={() => moveColor(index, "up")}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Mover para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={disabled || isLast}
                      onClick={() => moveColor(index, "down")}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => removeColor(index)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Remover cor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}