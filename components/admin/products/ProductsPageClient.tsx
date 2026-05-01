"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Eye,
  EyeOff,
  ImageIcon,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type { AdminProductListItem } from "@/components/admin/products/types";
import { formatCurrencyFromCents } from "@/components/admin/products/product-format";

type StatusFilter = "all" | "active" | "inactive";
type FeaturedFilter = "all" | "featured" | "not-featured";

export default function ProductsPageClient() {
  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOperating = operationMessage !== null;

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/products", {
        credentials: "include",
      });

      const data = (await response.json().catch(() => null)) as
        | AdminProductListItem[]
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(
          data && !Array.isArray(data) && data.message
            ? data.message
            : "Não foi possível carregar os produtos."
        );
        setProducts([]);
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError("Erro de conexão ao carregar produtos.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.active) ||
        (statusFilter === "inactive" && !product.active);

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && product.featured) ||
        (featuredFilter === "not-featured" && !product.featured);

      return matchesQuery && matchesStatus && matchesFeatured;
    });
  }, [featuredFilter, products, query, statusFilter]);

  async function handleToggleActive(product: AdminProductListItem) {
    if (isOperating) {
      return;
    }

    setOperationMessage(
      product.active ? "Desativando produto..." : "Ativando produto..."
    );
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          active: !product.active,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | AdminProductListItem
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "message" in data && data.message
            ? data.message
            : "Não foi possível atualizar o produto."
        );
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                active: !product.active,
              }
            : item
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar produto."
      );
    } finally {
      setOperationMessage(null);
    }
  }

  async function handleDelete(product: AdminProductListItem) {
    if (isOperating) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o produto "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setOperationMessage("Excluindo produto...");
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível excluir o produto.");
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao excluir produto."
      );
    } finally {
      setOperationMessage(null);
    }
  }

  return (
    <>
      <AdminOperationOverlay
        show={isOperating}
        title={operationMessage ?? "Processando produto..."}
        description="Aguarde até a operação terminar."
      />

      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
              Produtos
            </p>

            <div>
              <h1 className="font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
                Gerenciar produtos
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Cadastre, edite, ative e organize os produtos da loja.
              </p>
            </div>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo produto
          </Link>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-3 xl:grid-cols-[1fr_170px_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="search"
                value={query}
                disabled={isOperating}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome, slug ou SKU..."
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            <select
              value={statusFilter}
              disabled={isOperating}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <select
              value={featuredFilter}
              disabled={isOperating}
              onChange={(event) =>
                setFeaturedFilter(event.target.value as FeaturedFilter)
              }
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            >
              <option value="all">Destaque: todos</option>
              <option value="featured">Em destaque</option>
              <option value="not-featured">Sem destaque</option>
            </select>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <p className="text-sm font-semibold text-zinc-800">
              {filteredProducts.length} produto(s)
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-sm text-zinc-500">
              Carregando produtos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-sm text-zinc-500">
              Nenhum produto encontrado.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredProducts.map((product) => {
                const mainImage = product.images[0];
                const imageUrl = mainImage?.thumbUrl || mainImage?.url;

                return (
                  <article
                    key={product.id}
                    className="grid gap-4 p-5 hover:bg-zinc-50/70 lg:grid-cols-[1fr_150px_170px_auto]"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={mainImage?.altText || product.name}
                            width={160}
                            height={160}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-zinc-400">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-semibold text-zinc-950">
                            {product.name}
                          </h2>

                          {product.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              <Star className="h-3 w-3" />
                              Destaque
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 truncate text-xs text-zinc-500">
                          SKU: {product.sku} · {product.slug}
                        </p>

                        {product.shortDescription ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
                            {product.shortDescription}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center lg:justify-center">
                      <span className="text-sm font-bold text-zinc-950">
                        {formatCurrencyFromCents(product.priceInCents)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={[
                          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                          product.active
                            ? "bg-green-50 text-green-700"
                            : "bg-zinc-100 text-zinc-600",
                        ].join(" ")}
                      >
                        {product.active ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                        {product.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={isOperating}
                        onClick={() => handleToggleActive(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title={product.active ? "Desativar" : "Ativar"}
                      >
                        {product.active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        disabled={isOperating}
                        onClick={() => handleDelete(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}