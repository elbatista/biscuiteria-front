"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartColorOption = {
  id: number;
  name: string;
  hex: string;
};

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  priceInCents: number;
  imageUrl: string | null;
  quantity: number;

  requiresColor: boolean;
  availableColors: CartColorOption[];

  selectedColorId: number | null;
  selectedColorName: string | null;
  selectedColorHex: string | null;
};

type AddToCartInput = {
  productId: number;
  slug: string;
  name: string;
  priceInCents: number;
  imageUrl?: string | null;
  quantity?: number;

  availableColors?: CartColorOption[];

  selectedColorId?: number | null;
  selectedColorName?: string | null;
  selectedColorHex?: string | null;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: AddToCartInput) => void;
  removeItem: (itemKey: string) => void;

  setQuantity: (itemKey: string, quantity: number) => void;
  incrementItem: (itemKey: string) => void;
  decrementItem: (itemKey: string) => void;

  setItemColor: (
    itemKey: string,
    color: CartColorOption
  ) => void;

  clearCart: () => void;

  totalItems: () => number;
  subtotalInCents: () => number;
};

type PersistedCartState = {
  items?: Array<Partial<CartItem>>;
};

export function getCartItemKey(
  productId: number,
  selectedColorId?: number | null
) {
  return `${productId}:${selectedColorId ?? "no-color"}`;
}

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function normalizeColors(
  value: unknown
): CartColorOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (color): color is CartColorOption => {
      if (
        !color ||
        typeof color !== "object"
      ) {
        return false;
      }

      const candidate =
        color as Partial<CartColorOption>;

      return (
        typeof candidate.id === "number" &&
        typeof candidate.name === "string" &&
        typeof candidate.hex === "string"
      );
    }
  );
}

function normalizePersistedItem(
  item: Partial<CartItem>
): CartItem | null {
  if (
    typeof item.productId !== "number" ||
    typeof item.slug !== "string" ||
    typeof item.name !== "string" ||
    typeof item.priceInCents !== "number"
  ) {
    return null;
  }

  const selectedColorId =
    typeof item.selectedColorId === "number"
      ? item.selectedColorId
      : null;

  const availableColors =
    normalizeColors(item.availableColors);

  /*
   * Carrinhos antigos não possuíam
   * requiresColor / availableColors.
   *
   * Se já havia uma cor selecionada,
   * sabemos que o produto utilizava cor.
   */
  const requiresColor =
    typeof item.requiresColor === "boolean"
      ? item.requiresColor
      : selectedColorId !== null ||
        availableColors.length > 0;

  return {
    key:
      item.key ||
      getCartItemKey(
        item.productId,
        selectedColorId
      ),

    productId: item.productId,
    slug: item.slug,
    name: item.name,
    priceInCents: item.priceInCents,

    imageUrl:
      item.imageUrl ?? null,

    quantity:
      clampQuantity(item.quantity ?? 1),

    requiresColor,
    availableColors,

    selectedColorId,

    selectedColorName:
      item.selectedColorName ?? null,

    selectedColorHex:
      item.selectedColorHex ?? null,
  };
}

export const useCartStore =
  create<CartStore>()(
    persist(
      (set, get) => ({
        items: [],

        addItem: (item) => {
          const quantity =
            clampQuantity(
              item.quantity ?? 1
            );

          const availableColors =
            normalizeColors(
              item.availableColors
            );

          const requiresColor =
            availableColors.length > 0;

          const selectedColorId =
            item.selectedColorId ?? null;

          const selectedColorName =
            item.selectedColorName ?? null;

          const selectedColorHex =
            item.selectedColorHex ?? null;

          const itemKey =
            getCartItemKey(
              item.productId,
              selectedColorId
            );

          set((state) => {
            const existing =
              state.items.find(
                (cartItem) =>
                  cartItem.key === itemKey
              );

            if (existing) {
              return {
                items: state.items.map(
                  (cartItem) =>
                    cartItem.key === itemKey
                      ? {
                          ...cartItem,

                          quantity:
                            cartItem.quantity +
                            quantity,

                          requiresColor:
                            cartItem.requiresColor ||
                            requiresColor,

                          availableColors:
                            availableColors.length >
                            0
                              ? availableColors
                              : cartItem.availableColors,
                        }
                      : cartItem
                ),
              };
            }

            return {
              items: [
                ...state.items,

                {
                  key: itemKey,

                  productId:
                    item.productId,

                  slug:
                    item.slug,

                  name:
                    item.name,

                  priceInCents:
                    item.priceInCents,

                  imageUrl:
                    item.imageUrl ?? null,

                  quantity,

                  requiresColor,
                  availableColors,

                  selectedColorId,
                  selectedColorName,
                  selectedColorHex,
                },
              ],
            };
          });
        },

        removeItem: (itemKey) => {
          set((state) => ({
            items:
              state.items.filter(
                (item) =>
                  item.key !== itemKey
              ),
          }));
        },

        setQuantity: (
          itemKey,
          quantity
        ) => {
          const nextQuantity =
            clampQuantity(quantity);

          set((state) => ({
            items:
              state.items.map(
                (item) =>
                  item.key === itemKey
                    ? {
                        ...item,
                        quantity:
                          nextQuantity,
                      }
                    : item
              ),
          }));
        },

        incrementItem: (itemKey) => {
          set((state) => ({
            items:
              state.items.map(
                (item) =>
                  item.key === itemKey
                    ? {
                        ...item,
                        quantity:
                          item.quantity + 1,
                      }
                    : item
              ),
          }));
        },

        decrementItem: (itemKey) => {
          set((state) => ({
            items:
              state.items.map(
                (item) =>
                  item.key === itemKey
                    ? {
                        ...item,
                        quantity:
                          Math.max(
                            1,
                            item.quantity - 1
                          ),
                      }
                    : item
              ),
          }));
        },

        setItemColor: (
          itemKey,
          color
        ) => {
          set((state) => {
            const currentItem =
              state.items.find(
                (item) =>
                  item.key === itemKey
              );

            if (!currentItem) {
              return state;
            }

            /*
             * Não confiamos diretamente
             * no objeto recebido pelo botão.
             *
             * A cor precisa existir entre
             * as opções do próprio item.
             */
            const validColor =
              currentItem.availableColors.find(
                (availableColor) =>
                  availableColor.id ===
                  color.id
              );

            if (!validColor) {
              return state;
            }

            const nextKey =
              getCartItemKey(
                currentItem.productId,
                validColor.id
              );

            /*
             * Pode acontecer:
             *
             * Produto X / sem cor
             * Produto X / rosa
             *
             * Se o usuário escolher rosa
             * no item pendente, juntamos
             * as duas linhas.
             */
            const existingTarget =
              state.items.find(
                (item) =>
                  item.key === nextKey &&
                  item.key !== itemKey
              );

            if (existingTarget) {
              return {
                items:
                  state.items
                    .filter(
                      (item) =>
                        item.key !== itemKey
                    )
                    .map((item) =>
                      item.key === nextKey
                        ? {
                            ...item,

                            quantity:
                              item.quantity +
                              currentItem.quantity,

                            requiresColor:
                              true,

                            availableColors:
                              currentItem.availableColors,
                          }
                        : item
                    ),
              };
            }

            return {
              items:
                state.items.map(
                  (item) =>
                    item.key === itemKey
                      ? {
                          ...item,

                          key:
                            nextKey,

                          requiresColor:
                            true,

                          selectedColorId:
                            validColor.id,

                          selectedColorName:
                            validColor.name,

                          selectedColorHex:
                            validColor.hex,
                        }
                      : item
                ),
            };
          });
        },

        clearCart: () => {
          set({
            items: [],
          });
        },

        totalItems: () => {
          return get().items.reduce(
            (acc, item) =>
              acc + item.quantity,
            0
          );
        },

        subtotalInCents: () => {
          return get().items.reduce(
            (acc, item) =>
              acc +
              item.priceInCents *
                item.quantity,
            0
          );
        },
      }),

      {
        name: "biscuiteria-cart",

        version: 3,

        storage:
          createJSONStorage(
            () => localStorage
          ),

        partialize: (state) => ({
          items: state.items,
        }),

        migrate: (
          persistedState
        ) => {
          const state =
            persistedState as PersistedCartState;

          return {
            items:
              (state.items ?? [])
                .map((item) =>
                  normalizePersistedItem(
                    item
                  )
                )
                .filter(
                  (
                    item
                  ): item is CartItem =>
                    item !== null
                ),
          };
        },
      }
    )
  );