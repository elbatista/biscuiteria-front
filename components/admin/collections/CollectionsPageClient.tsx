"use client";

import Image from "next/image";
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
  ImageIcon,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type {
  AdminCollection,
  AdminCollectionsResponse,
} from "@/components/admin/collections/types";

const PAGE_SIZE = 100;

type BooleanFilter = "all" | "true" | "false";

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function sortCollections(collections: AdminCollection[]) {
  return [...collections].sort((a, b) => {
    const orderDiff = a.sortOrder - b.sortOrder;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.title.localeCompare(b.title, "pt-BR");
  });
}

function collectionPayload(collection: AdminCollection, sortOrder: number) {
  return {
    title: collection.title,
    slug: collection.slug,
    description: collection.description ?? "",
    coverImageUrl: collection.coverImageUrl ?? "",
    coverImageThumbUrl: collection.coverImageThumbUrl ?? "",
    coverImageAlt: collection.coverImageAlt ?? "",
    isActive: collection.isActive,
    isFeatured: collection.isFeatured,
    sortOrder,
    startsAt: collection.startsAt ?? "",
    endsAt: collection.endsAt ?? "",
  };
}

export default function CollectionsPageClient() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<BooleanFilter>("all");
  const [featuredFilter, setFeaturedFilter] = useState<BooleanFilter>("all");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AdminCollectionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [movingId, setMovingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const canReorder =
    query.trim() === "" &&
    activeFilter === "all" &&
    featuredFilter === "all";

  const isOperating =
    operationMessage !== null ||
    deletingId !== null ||
    movingId !== null ||
    isPending;

  const overlayTitle =
    operationMessage ??
    (deletingId !== null
      ? "Excluindo coleção..."
      : movingId !== null
        ? "Reordenando coleções..."
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

    if (featuredFilter !== "all") {
      params.set("featured", featuredFilter);
    }

    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    return params;
  }, [activeFilter, featuredFilter, page, query]);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/collections?${searchParams}`, {
        credentials: "include",
      });

      const responseData = (await response.json().catch(() => null)) as
        | AdminCollectionsResponse
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(
          responseData && "message" in responseData && responseData.message
            ? responseData.message
            : "Não foi possível carregar as coleções."
        );
        setData(null);
        return;
      }

      const collectionsResponse = responseData as AdminCollectionsResponse;

      setData({
        ...collectionsResponse,
        items: sortCollections(collectionsResponse.items),
      });
    } catch {
      setError("Erro de conexão ao carregar coleções.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPage(1);

    startTransition(() => {
      loadCollections();
    });
  }

  async function updateCollectionSortOrder(
    collection: AdminCollection,
    sortOrder: number
  ) {
    const response = await fetch(`/api/admin/collections/${collection.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(collectionPayload(collection, sortOrder)),
    });

    const responseData = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new Error(responseData?.message ?? "Não foi possível reordenar.");
    }
  }

  async function handleMove(
    collection: AdminCollection,
    direction: "up" | "down"
  ) {
    if (!data || !canReorder || isOperating) {
      return;
    }

    const collections = sortCollections(data.items);
    const currentIndex = collections.findIndex(
      (item) => item.id === collection.id
    );

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (!collections[targetIndex]) {
      return;
    }

    const reordered = [...collections];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    setMovingId(collection.id);
    setOperationMessage("Reordenando coleções...");
    setError(null);

    try {
      await Promise.all(
        reordered.map((item, index) =>
          updateCollectionSortOrder(item, index + 1)
        )
      );

      await loadCollections();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível reordenar coleções."
      );
    } finally {
      setMovingId(null);
      setOperationMessage(null);
    }
  }

  async function handleDelete(collection: AdminCollection) {
    if (isOperating) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a coleção "${collection.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(collection.id);
    setOperationMessage("Excluindo coleção...");
    setError(null);

    try {
      const response = await fetch(`/api/admin/collections/${collection.id}`, {
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

      await loadCollections();
    } catch {
      setError("Erro de conexão ao excluir coleção.");
    } finally {
      setDeletingId(null);
      setOperationMessage(null);
    }
  }

  const collections = sortCollections(data?.items ?? []);

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
              Coleções
            </p>

            <div>
              <h1 className="font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
                Gerenciar coleções
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Crie, destaque e organize coleções temáticas da loja.
              </p>
            </div>
          </div>

          <Link
            href="/admin/collections/new"
            aria-disabled={isOperating}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90",
              isOperating ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
          >
            <Plus className="h-4 w-4" />
            Nova coleção
          </Link>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-3 xl:grid-cols-[1fr_170px_190px_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                type="search"
                value={query}
                disabled={isOperating}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por título, slug ou descrição..."
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            <select
              value={activeFilter}
              disabled={isOperating}
              onChange={(event) => {
                setActiveFilter(event.target.value as BooleanFilter);
                setPage(1);
              }}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            >
              <option value="all">Todas</option>
              <option value="true">Ativas</option>
              <option value="false">Inativas</option>
            </select>

            <select
              value={featuredFilter}
              disabled={isOperating}
              onChange={(event) => {
                setFeaturedFilter(event.target.value as BooleanFilter);
                setPage(1);
              }}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            >
              <option value="all">Destaque: todas</option>
              <option value="true">Em destaque</option>
              <option value="false">Sem destaque</option>
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
              ? "Use as setas na tabela para mudar a ordem das coleções. Novas coleções entram automaticamente no final."
              : "Para reordenar, limpe a busca e selecione os filtros “Todas”."}
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
              {data ? `${data.total} coleção(ões)` : "Coleções"}
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-sm text-zinc-500">
              Carregando coleções...
            </div>
          ) : collections.length === 0 ? (
            <div className="p-8 text-sm text-zinc-500">
              Nenhuma coleção encontrada.
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
                      Coleção
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Produtos
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-zinc-600">
                      Período
                    </th>
                    <th className="px-5 py-3 text-right font-semibold text-zinc-600">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100 bg-white">
                  {collections.map((collection, index) => {
                    const isFirst = index === 0;
                    const isLast = index === collections.length - 1;
                    const coverUrl =
                      collection.coverImageThumbUrl || collection.coverImageUrl;

                    return (
                      <tr key={collection.id} className="hover:bg-zinc-50/70">
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-10 rounded-xl bg-zinc-100 px-2 py-1 text-center font-mono text-xs font-semibold text-zinc-600">
                              {collection.sortOrder}
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
                                onClick={() => handleMove(collection, "up")}
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
                                onClick={() => handleMove(collection, "down")}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Mover para baixo"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="min-w-[280px] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                              {coverUrl ? (
                                <Image
                                  src={coverUrl}
                                  alt={
                                    collection.coverImageAlt ||
                                    collection.title
                                  }
                                  width={112}
                                  height={112}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                  <ImageIcon className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate font-semibold text-zinc-900">
                                {collection.title}
                              </div>

                              <div className="truncate text-xs text-zinc-500">
                                {collection.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={[
                                "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold",
                                collection.isActive
                                  ? "bg-green-50 text-green-700"
                                  : "bg-zinc-100 text-zinc-600",
                              ].join(" ")}
                            >
                              {collection.isActive ? "Ativa" : "Inativa"}
                            </span>

                            {collection.isFeatured ? (
                              <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                Destaque
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-zinc-600">
                          {collection._count.products}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-zinc-500">
                          {formatDate(collection.startsAt)} —{" "}
                          {formatDate(collection.endsAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/collections/${collection.id}`}
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
                              onClick={() => handleDelete(collection)}
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