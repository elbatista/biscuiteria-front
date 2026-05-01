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
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type { AdminFaqItem, AdminFaqResponse } from "@/components/admin/faq/types";

type ActiveFilter = "all" | "true" | "false";

function sortFaqItems(items: AdminFaqItem[]) {
  return [...items].sort((a, b) => {
    const orderDiff = a.position - b.position;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.id - b.id;
  });
}

function faqPayload(item: AdminFaqItem, position: number) {
  return {
    question: item.question,
    answer: item.answer,
    active: item.active,
    position,
  };
}

export default function FaqPageClient() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const [items, setItems] = useState<AdminFaqItem[]>([]);
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
      ? "Excluindo pergunta..."
      : movingId !== null
        ? "Reordenando perguntas..."
        : isPending
          ? "Atualizando lista..."
          : "Processando...");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortFaqItems(items).filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery);

      const matchesActive =
        activeFilter === "all" ||
        String(item.active) === activeFilter;

      return matchesQuery && matchesActive;
    });
  }, [activeFilter, items, query]);

  const loadFaqItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/settings/faq", {
        credentials: "include",
      });

      const data = (await response.json().catch(() => null)) as
        | AdminFaqResponse
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(
          data && "message" in data && data.message
            ? data.message
            : "Não foi possível carregar o FAQ."
        );
        setItems([]);
        return;
      }

      setItems(sortFaqItems((data as AdminFaqResponse).items ?? []));
    } catch {
      setError("Erro de conexão ao carregar FAQ.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFaqItems();
  }, [loadFaqItems]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      loadFaqItems();
    });
  }

  async function updateFaqPosition(item: AdminFaqItem, position: number) {
    const response = await fetch(`/api/admin/settings/faq/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(faqPayload(item, position)),
    });

    const data = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      throw new Error(data?.message ?? "Não foi possível reordenar.");
    }
  }

  async function handleMove(item: AdminFaqItem, direction: "up" | "down") {
    if (!canReorder || isOperating) {
      return;
    }

    const orderedItems = sortFaqItems(items);
    const currentIndex = orderedItems.findIndex((entry) => entry.id === item.id);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (!orderedItems[targetIndex]) {
      return;
    }

    const reordered = [...orderedItems];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    setMovingId(item.id);
    setOperationMessage("Reordenando perguntas...");
    setError(null);

    try {
      await Promise.all(
        reordered.map((entry, index) => updateFaqPosition(entry, index + 1))
      );

      await loadFaqItems();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível reordenar o FAQ."
      );
    } finally {
      setMovingId(null);
      setOperationMessage(null);
    }
  }

  async function handleDelete(item: AdminFaqItem) {
    if (isOperating) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a pergunta "${item.question}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setOperationMessage("Excluindo pergunta...");
    setError(null);

    try {
      const response = await fetch(`/api/admin/settings/faq/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(data?.message ?? "Não foi possível excluir.");
        return;
      }

      await loadFaqItems();
    } catch {
      setError("Erro de conexão ao excluir pergunta.");
    } finally {
      setDeletingId(null);
      setOperationMessage(null);
    }
  }

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
              FAQ
            </p>

            <div>
              <h1 className="font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
                Perguntas frequentes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Gerencie as perguntas e respostas exibidas na página pública de
                FAQ e nos previews da loja.
              </p>
            </div>
          </div>

          <Link
            href="/admin/settings/faq/new"
            aria-disabled={isOperating}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90",
              isOperating ? "pointer-events-none opacity-60" : "",
            ].join(" ")}
          >
            <Plus className="h-4 w-4" />
            Nova pergunta
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
                placeholder="Buscar por pergunta ou resposta..."
                className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            <select
              value={activeFilter}
              disabled={isOperating}
              onChange={(event) =>
                setActiveFilter(event.target.value as ActiveFilter)
              }
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
              ? "Use as setas para mudar a ordem das perguntas. Novas perguntas entram automaticamente no final."
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
              {filteredItems.length} pergunta(s)
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-sm text-zinc-500">
              Carregando perguntas...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-sm text-zinc-500">
              Nenhuma pergunta encontrada.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredItems.map((item, index) => {
                const orderedItems = sortFaqItems(items);
                const realIndex = orderedItems.findIndex(
                  (entry) => entry.id === item.id
                );
                const isFirst = realIndex === 0;
                const isLast = realIndex === orderedItems.length - 1;

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 p-5 hover:bg-zinc-50/70 lg:grid-cols-[140px_1fr_auto]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="min-w-10 rounded-xl bg-zinc-100 px-2 py-1 text-center font-mono text-xs font-semibold text-zinc-600">
                        {item.position}
                      </span>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={!canReorder || isFirst || isOperating}
                          onClick={() => handleMove(item, "up")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Mover para cima"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={!canReorder || isLast || isOperating}
                          onClick={() => handleMove(item, "down")}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-zinc-950">
                          {item.question}
                        </h2>

                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                            item.active
                              ? "bg-green-50 text-green-700"
                              : "bg-zinc-100 text-zinc-600",
                          ].join(" ")}
                        >
                          {item.active ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          {item.active ? "Ativa" : "Inativa"}
                        </span>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-zinc-500">
                        {item.answer}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/settings/faq/${item.id}`}
                        aria-disabled={isOperating}
                        className={[
                          "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950",
                          isOperating ? "pointer-events-none opacity-50" : "",
                        ].join(" ")}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        disabled={isOperating}
                        onClick={() => handleDelete(item)}
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