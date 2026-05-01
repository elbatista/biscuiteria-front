"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type {
  AdminCategoriesResponse,
  AdminCategory,
} from "@/components/admin/categories/types";

const PAGE_SIZE = 100;

type ActiveFilter = "all" | "true" | "false";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function sortCategories(categories: AdminCategory[]) {
  return [...categories].sort((a, b) => {
    const orderDiff = a.sortOrder - b.sortOrder;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.name.localeCompare(b.name, "pt-BR");
  });
}

export default function CategoriesPageClient() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AdminCategoriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const canReorder = query.trim() === "" && activeFilter === "all";

  const isOperating =
    operationMessage !== null ||
    deletingId !== null ||
    movingId !== null ||
    isPending;

  const overlayTitle =
    operationMessage ??
    (deletingId !== null
      ? "Excluindo categoria..."
      : movingId !== null
        ? "Reordenando categorias..."
        : isPending
          ? "Atualizando lista..."
          : "Processando...");

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (activeFilter !== "all") {
      params.set("active", activeFilter);
    }

    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    return params;
  }, [activeFilter, page, query]);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories?${searchParams}`, {
        credentials: "include",
      });

      const responseData = (await response.json().catch(() => null)) as
        | AdminCategoriesResponse
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(
          responseData && "message" in responseData && responseData.message
            ? responseData.message
            : "Não foi possível carregar as categorias."
        );
        setData(null);
        return;
      }

      const categoriesResponse = responseData as AdminCategoriesResponse;

      setData({
        ...categoriesResponse,
        items: sortCategories(categoriesResponse.items),
      });
    } catch {
      setError("Erro de conexão ao carregar categorias.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPage(1);

    startTransition(() => {
      loadCategories();
    });
  }

  async function updateCategorySortOrder(
    category: AdminCategory,
    sortOrder: number
  ) {
    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        sortOrder,
      }),
    });

    const responseData = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new Error(responseData?.message ?? "Não foi possível reordenar.");
    }
  }

  async function handleMove(category: AdminCategory, direction: "up" | "down") {
    if (!data || !canReorder || isOperating) {
      return;
    }

    const categories = sortCategories(data.items);
    const currentIndex = categories.findIndex((item) => item.id === category.id);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    const targetCategory = categories[targetIndex];

    if (!targetCategory) {
      return;
    }

    setMovingId(category.id);
    setOperationMessage("Reordenando categorias...");
    setError(null);

    try {
      await updateCategorySortOrder(category, targetIndex + 1);
      await updateCategorySortOrder(targetCategory, currentIndex + 1);

      await loadCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível reordenar categorias."
      );
    } finally {
      setMovingId(null);
      setOperationMessage(null);
    }
  }

  async function handleDelete(category: AdminCategory) {
    if (isOperating) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a categoria "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setOperationMessage("Excluindo categoria...");
    setError(null);

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const responseData = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(responseData?.message ?? "Não foi possível excluir.");
        return;
      }

      await loadCategories();
    } catch {
      setError("Erro de conexão ao excluir categoria.");
    } finally {
      setDeletingId(null);
      setOperationMessage(null);
    }
  }

  const categories = sortCategories(data?.items ?? []);

  return (
    <>
      <AdminOperationOverlay
        show={isOperating}
        title={overlayTitle}
        description="Aguarde até a operação terminar. Outras ações ficam bloqueadas para evitar alterações conflitantes."
      />

      <div className="space-y-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
              Categorias
            </p>

            <div>
              <h1 className="font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
                Gerenciar categorias
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Crie, organize e reordene as categorias usadas para filtrar
                produtos na loja.
              </p>
            </div>
          </div>

          <Link
            href="/admin/categories/new"
            aria-disabled={isOperating}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90",
              isOperating ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
          >
            <Plus className="h-4 w-4" />
            Nova categoria
          </Link>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-3 lg:grid-cols-[1fr_180px_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="search"
                value={query}
                disabled={isOperating}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou slug..."
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            <select
              value={activeFilter}
              disabled={isOperating}
              onChange={(event) => {
                setActiveFilter(event.target.value as ActiveFilter);
                setPage(1);
              }}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            >
              <option value="all">Todas</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </select>

            <button
              type="submit"
              disabled={isOperating}
              className="rounded-2xl border border-zinc-200 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Filtrar
            </button>
          </form>

          <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
            {canReorder
                ? "Use as setas na tabela para mudar a ordem das categorias. Novas categorias entram automaticamente no final."
                : "Para reordenar, limpe a busca e selecione o filtro “Todas”."}
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
              {data ? `${data.total} categoria(s)` : "Categorias"}
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-sm text-zinc-500">
              Carregando categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-sm text-zinc-500">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Ordem
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Nome
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Slug
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Produtos
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Atualizada
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-zinc-600">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100 bg-white">
                  {categories.map((category, index) => {
                    const isFirst = index === 0;
                    const isLast = index === categories.length - 1;

                    return (
                      <tr key={category.id} className="hover:bg-zinc-50/70">
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-10 rounded-xl bg-zinc-100 px-2 py-1 text-center font-mono text-xs font-semibold text-zinc-600">
                              {category.sortOrder}
                            </span>

                            <div className="flex gap-1">
                              <button
                                type="button"
                                disabled={
                                  !canReorder ||
                                  isFirst ||
                                  isOperating ||
                                  data?.totalPages !== 1
                                }
                                onClick={() => handleMove(category, "up")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Mover para cima"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                disabled={
                                  !canReorder ||
                                  isLast ||
                                  isOperating ||
                                  data?.totalPages !== 1
                                }
                                onClick={() => handleMove(category, "down")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-zinc-900">
                          {category.name}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                          {category.slug}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                              category.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-zinc-100 text-zinc-600",
                            ].join(" ")}
                          >
                            {category.isActive ? "Ativa" : "Inativa"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-zinc-600">
                          {category._count.products}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                          {formatDate(category.updatedAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/categories/${category.id}`}
                              aria-disabled={isOperating}
                              className={[
                                "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950",
                                isOperating
                                  ? "pointer-events-none opacity-50"
                                  : "",
                              ].join(" ")}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>

                            <button
                              type="button"
                              disabled={isOperating}
                              onClick={() => handleDelete(category)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data && data.totalPages > 1 ? (
            <div className="flex flex-col gap-3 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-500">
                Página {data.page} de {data.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isOperating}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={page >= data.totalPages || isOperating}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(data.totalPages, current + 1)
                    )
                  }
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}