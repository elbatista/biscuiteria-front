"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  priceInCents: number;
  imageUrl: string | null;
  quantity: number;
};

type AddToCartInput = {
  productId: number;
  slug: string;
  name: string;
  priceInCents: number;
  imageUrl?: string | null;
  quantity?: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: AddToCartInput) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  incrementItem: (productId: number) => void;
  decrementItem: (productId: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotalInCents: () => number;
};

function clampQuantity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const quantity = clampQuantity(item.quantity ?? 1);

        set((state) => {
          const existing = state.items.find(
            (cartItem) => cartItem.productId === item.productId
          );

          if (existing) {
            return {
              items: state.items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? {
                      ...cartItem,
                      quantity: cartItem.quantity + quantity,
                    }
                  : cartItem
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: item.productId,
                slug: item.slug,
                name: item.name,
                priceInCents: item.priceInCents,
                imageUrl: item.imageUrl ?? null,
                quantity,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      setQuantity: (productId, quantity) => {
        const nextQuantity = clampQuantity(quantity);

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: nextQuantity }
              : item
          ),
        }));
      },

      incrementItem: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }));
      },

      decrementItem: (productId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      subtotalInCents: () => {
        return get().items.reduce(
          (acc, item) => acc + item.priceInCents * item.quantity,
          0
        );
      },
    }),
    {
      name: "biscuiteria-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);