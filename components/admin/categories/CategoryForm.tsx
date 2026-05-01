"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type {
  AdminCategoriesResponse,
  AdminCategory,
  CategoryFormValues,
} from "@/components/admin/categories/types";

type CategoryFormProps = {
  mode: "create" | "edit";
  initialCategory?: AdminCategory;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryForm({
  mode,
  initialCategory,
}: CategoryFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<CategoryFormValues>({
    name: initialCategory?.name ?? "",
    isActive: initialCategory?.isActive ?? true,
    sortOrder: initialCategory?.sortOrder ?? 1,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(mode === "create");
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const generatedSlug = useMemo(() => {
    return slugify(values.name);
  }, [values.name]);

  const showOverlay = isLoadingOrder || isSaving || isPending;

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    async function loadNextSortOrder() {
      setIsLoadingOrder(true);

      try {
        const response = await fetch(
          "/api/admin/categories?page=1&pageSize=500",
          {
            credentials: "include",
          }
        );

        const data = (await response.json().catch(() => null)) as
          | AdminCategoriesResponse
          | null;

        if (!response.ok || !data?.items) {
          setValues((current) => ({
            ...current,
            sortOrder: 1,
          }));
          return;
        }

        const maxSortOrder = data.items.reduce((max, category) => {
          return Math.max(max, Number(category.sortOrder) || 0);
        }, 0);

        setValues((current) => ({
          ...current,
          sortOrder: maxSortOrder + 1,
        }));
      } catch {
        setValues((current) => ({
          ...current,
          sortOrder: 1,
        }));
      } finally {
        setIsLoadingOrder(false);
      }
    }

    loadNextSortOrder();
  }, [mode]);

  function updateValue<K extends keyof CategoryFormValues>(
    key: K,
    value: CategoryFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const slug = generatedSlug;

    if (!slug) {
      setError("Informe um nome válido para gerar o slug da categoria.");
      return;
    }

    const payload = {
      name: values.name.trim(),
      slug,
      isActive: values.isActive,
      sortOrder: Number(values.sortOrder) || 1,
    };

    const url =
      mode === "create"
        ? "/api/admin/categories"
        : `/api/admin/categories/${initialCategory?.id}`;

    const method = mode === "create" ? "POST" : "PUT";

    setIsSaving(true);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(data?.message ?? "Não foi possível salvar a categoria.");
        setIsSaving(false);
        return;
      }

      startTransition(() => {
        router.push("/admin/categories");
        router.refresh();
      });
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setIsSaving(false);
    }
  }

  return (
    <>
      <AdminOperationOverlay
        show={showOverlay}
        title={
          isLoadingOrder
            ? "Preparando categoria..."
            : mode === "create"
              ? "Criando categoria..."
              : "Salvando categoria..."
        }
        description={
          isLoadingOrder
            ? "Calculando a próxima posição da categoria."
            : "Aguarde enquanto salvamos as alterações."
        }
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="grid gap-6">
          <div className="space-y-2">
            <label
              htmlFor="category-name"
              className="text-sm font-semibold text-zinc-800"
            >
              Nome da categoria
            </label>

            <input
              id="category-name"
              type="text"
              required
              minLength={2}
              disabled={showOverlay}
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Ex: Chimarrão"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-800">
                Slug gerado automaticamente
              </p>

              <p className="mt-2 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm text-zinc-600 ring-1 ring-zinc-200">
                {generatedSlug || "categoria"}
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                O slug será atualizado automaticamente sempre que o nome da
                categoria mudar.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-800">
                Posição na lista
              </p>

              <p className="mt-2 rounded-xl bg-white px-3 py-2 font-mono text-sm text-zinc-600 ring-1 ring-zinc-200">
                {isLoadingOrder ? "calculando..." : values.sortOrder}
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {mode === "create"
                  ? "Novas categorias são adicionadas automaticamente ao final da lista."
                  : "Para mudar a posição, use as setas na listagem de categorias."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={values.isActive}
                disabled={showOverlay}
                onChange={(event) =>
                  updateValue("isActive", event.target.checked)
                }
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)] disabled:cursor-not-allowed disabled:opacity-50"
              />

              <span>
                <span className="block text-sm font-semibold text-zinc-800">
                  Categoria ativa
                </span>

                <span className="mt-1 block text-xs leading-5 text-zinc-500">
                  Categorias inativas não devem aparecer como filtro público da
                  loja.
                </span>
              </span>
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={showOverlay}
              onClick={() => router.push("/admin/categories")}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={showOverlay}
              className="rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Salvando..."
                : mode === "create"
                  ? "Criar categoria"
                  : "Salvar alterações"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}