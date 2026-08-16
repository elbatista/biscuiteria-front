"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronsUpDown,
  PackageSearch,
  Search,
} from "lucide-react";

import type { AdminProductListItem } from "@/components/admin/products/types";

type ProductEditSwitcherProps = {
  currentProductId: number;
  hasUnsavedChanges?: boolean;
  onSaveCurrentProduct?: () => Promise<boolean>;
};

function sortProducts(products: AdminProductListItem[]) {
  return [...products].sort((a, b) => {
    return a.name.localeCompare(b.name, "pt-BR");
  });
}

function getProductImageUrl(product: AdminProductListItem) {
  const firstImage = [...(product.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  )[0];

  return firstImage?.thumbUrl || firstImage?.url || null;
}

function getProductLabel(product: AdminProductListItem) {
  return `${product.name} · ${product.sku}`;
}

export default function ProductEditSwitcher({
  currentProductId,
  hasUnsavedChanges = false,
  onSaveCurrentProduct,
}: ProductEditSwitcherProps) {
  const router = useRouter();

  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingProductId, setPendingProductId] = useState<number | null>(null);
  const [isResolvingPrompt, setIsResolvingPrompt] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/admin/products", {
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | AdminProductListItem[]
          | { message?: string }
          | null;

        if (!cancelled && response.ok && Array.isArray(data)) {
          setProducts(sortProducts(data));
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentProduct = useMemo(() => {
    return products.find((product) => product.id === currentProductId) ?? null;
  }, [currentProductId, products]);

  const currentIndex = useMemo(() => {
    return products.findIndex((product) => product.id === currentProductId);
  }, [currentProductId, products]);

  const previousProduct = currentIndex > 0 ? products[currentIndex - 1] : null;

  const nextProduct =
    currentIndex >= 0 && currentIndex < products.length - 1
      ? products[currentIndex + 1]
      : null;

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, query]);

  function navigateWithoutPrompt(productId: number) {
    if (productId === currentProductId || isPending) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);
    setPendingProductId(null);

    startTransition(() => {
      router.push(`/admin/products/${productId}`);
      router.refresh();
    });
  }

  function requestNavigation(productId: number) {
    if (productId === currentProductId || isPending || isResolvingPrompt) {
      setIsOpen(false);
      return;
    }

    if (hasUnsavedChanges) {
      setIsOpen(false);
      setPendingProductId(productId);
      return;
    }

    navigateWithoutPrompt(productId);
  }

  async function handleSaveAndNavigate() {
    if (!pendingProductId || !onSaveCurrentProduct || isResolvingPrompt) {
      return;
    }

    setIsResolvingPrompt(true);

    try {
      const saved = await onSaveCurrentProduct();

      if (saved) {
        navigateWithoutPrompt(pendingProductId);
      }
    } finally {
      setIsResolvingPrompt(false);
    }
  }

  function handleDiscardAndNavigate() {
    if (!pendingProductId || isResolvingPrompt) {
      return;
    }

    navigateWithoutPrompt(pendingProductId);
  }

  function handleCancelNavigation() {
    if (isResolvingPrompt) {
      return;
    }

    setPendingProductId(null);
  }

  function handleSelect(event: ChangeEvent<HTMLSelectElement>) {
    const selectedProductId = Number(event.target.value);

    if (!Number.isInteger(selectedProductId) || selectedProductId <= 0) {
      return;
    }

    requestNavigation(selectedProductId);
  }

  const currentImageUrl = currentProduct
    ? getProductImageUrl(currentProduct)
    : null;

  const pendingProduct =
    pendingProductId !== null
      ? products.find((product) => product.id === pendingProductId) ?? null
      : null;

  return (
    <>
      {pendingProductId !== null ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-zinc-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--rose-500)]">
              Alterações não salvas
            </p>

            <h2 className="mt-3 text-xl font-semibold text-zinc-950">
              Salvar antes de trocar produto?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Você fez alterações neste produto. Antes de abrir{" "}
              <span className="font-semibold text-zinc-800">
                {pendingProduct?.name ?? "outro produto"}
              </span>
              , escolha se deseja salvar ou descartar as mudanças atuais.
            </p>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                disabled={isResolvingPrompt}
                onClick={handleSaveAndNavigate}
                className="rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResolvingPrompt ? "Salvando..." : "Salvar e trocar"}
              </button>

              <button
                type="button"
                disabled={isResolvingPrompt}
                onClick={handleDiscardAndNavigate}
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Descartar e trocar
              </button>

              <button
                type="button"
                disabled={isResolvingPrompt}
                onClick={handleCancelNavigation}
                className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="sticky top-[4.6rem] z-30 rounded-[2rem] border border-zinc-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-400">
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={currentProduct?.name ?? "Produto"}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PackageSearch className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--rose-500)]">
                Editando produto
              </p>

              <h2 className="mt-1 truncate text-sm font-semibold text-zinc-950 sm:text-base">
                {isLoading
                  ? "Carregando produtos..."
                  : currentProduct?.name ?? "Produto atual"}
              </h2>

              <p className="mt-0.5 truncate text-xs text-zinc-500">
                {currentProduct
                  ? `SKU: ${currentProduct.sku}`
                  : products.length > 0
                    ? `${products.length} produto(s) disponíveis`
                    : "Use os controles para trocar de produto."}
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[auto_1fr_auto] xl:min-w-[620px]">
            <button
              type="button"
              disabled={!previousProduct || isLoading || isPending}
              onClick={() =>
                previousProduct ? requestNavigation(previousProduct.id) : null
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                previousProduct
                  ? `Editar ${previousProduct.name}`
                  : "Não há produto anterior"
              }
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="relative">
              <button
                type="button"
                disabled={isLoading || isPending || products.length === 0}
                onClick={() => setIsOpen((current) => !current)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="truncate">
                  {currentProduct
                    ? getProductLabel(currentProduct)
                    : "Trocar produto"}
                </span>

                <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-400" />
              </button>

              {isOpen ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-xl">
                  <div className="border-b border-zinc-100 p-3">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                      <input
                        type="search"
                        value={query}
                        autoFocus
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar por nome, SKU ou slug..."
                        className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100"
                      />
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto p-2">
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-zinc-500">
                        Nenhum produto encontrado.
                      </div>
                    ) : (
                      filteredProducts.map((product) => {
                        const active = product.id === currentProductId;
                        const imageUrl = getProductImageUrl(product);

                        return (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => requestNavigation(product.id)}
                            className={[
                              "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition",
                              active
                                ? "bg-rose-50 text-[var(--rose-500)]"
                                : "text-zinc-700 hover:bg-zinc-50",
                            ].join(" ")}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white text-zinc-400">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  width={80}
                                  height={80}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <PackageSearch className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">
                                {product.name}
                              </p>

                              <p className="mt-0.5 truncate text-xs opacity-70">
                                SKU: {product.sku}
                              </p>
                            </div>

                            {!product.active ? (
                              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500">
                                Inativo
                              </span>
                            ) : null}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              disabled={!nextProduct || isLoading || isPending}
              onClick={() =>
                nextProduct ? requestNavigation(nextProduct.id) : null
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              title={
                nextProduct
                  ? `Editar ${nextProduct.name}`
                  : "Não há próximo produto"
              }
            >
              <span className="hidden sm:inline">Próximo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="sm:hidden">
            <select
              value={currentProductId}
              disabled={isLoading || isPending || products.length === 0}
              onChange={handleSelect}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasUnsavedChanges ? (
          <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700">
            Existem alterações não salvas neste produto.
          </div>
        ) : null}

        {isPending ? (
          <div className="mt-3 rounded-2xl bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-500">
            Carregando outro produto...
          </div>
        ) : null}
      </section>
    </>
  );
}