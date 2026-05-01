"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type {
  AdminCollection,
  AdminCollectionsResponse,
  CollectionFormValues,
  UploadCollectionCoverResponse,
} from "@/components/admin/collections/types";

type CollectionFormProps = {
  mode: "create" | "edit";
  initialCollection?: AdminCollection;
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

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

async function uploadCollectionCover(file: File, title: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);

  const response = await fetch("/api/admin/collections/upload-cover", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await response.json().catch(() => null)) as
    | UploadCollectionCoverResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      data && "message" in data && data.message
        ? data.message
        : "Não foi possível enviar a capa."
    );
  }

  return data as UploadCollectionCoverResponse;
}

export default function CollectionForm({
  mode,
  initialCollection,
}: CollectionFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<CollectionFormValues>({
    title: initialCollection?.title ?? "",
    description: initialCollection?.description ?? "",
    coverImageAlt: initialCollection?.coverImageAlt ?? "",
    isActive: initialCollection?.isActive ?? true,
    isFeatured: initialCollection?.isFeatured ?? false,
    sortOrder: initialCollection?.sortOrder ?? 1,
    startsAt: toDateInputValue(initialCollection?.startsAt),
    endsAt: toDateInputValue(initialCollection?.endsAt),
  });

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [removeCurrentCover, setRemoveCurrentCover] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(mode === "create");
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const generatedSlug = useMemo(() => slugify(values.title), [values.title]);

  const showOverlay = isLoadingOrder || isSaving || isPending;

  const currentCoverUrl =
    !removeCurrentCover && !coverPreviewUrl
      ? initialCollection?.coverImageUrl || initialCollection?.coverImageThumbUrl || null
      : null;

  const visibleCoverUrl = coverPreviewUrl || currentCoverUrl;

  useEffect(() => {
    if (!coverFile) {
      setCoverPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverFile]);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    async function loadNextSortOrder() {
      setIsLoadingOrder(true);

      try {
        const response = await fetch(
          "/api/admin/collections?page=1&pageSize=500",
          {
            credentials: "include",
          }
        );

        const data = (await response.json().catch(() => null)) as
          | AdminCollectionsResponse
          | null;

        if (!response.ok || !data?.items) {
          setValues((current) => ({
            ...current,
            sortOrder: 1,
          }));
          return;
        }

        const maxSortOrder = data.items.reduce((max, collection) => {
          return Math.max(max, Number(collection.sortOrder) || 0);
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

  function updateValue<K extends keyof CollectionFormValues>(
    key: K,
    value: CollectionFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleCoverChange(file: File | null) {
    setCoverFile(file);
    setRemoveCurrentCover(false);
  }

  function handleRemoveCover() {
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setRemoveCurrentCover(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const slug = generatedSlug;

    if (!slug) {
      setError("Informe um título válido para gerar o slug da coleção.");
      return;
    }

    if (values.endsAt && values.startsAt && values.endsAt < values.startsAt) {
      setError("A data final não pode ser menor que a data inicial.");
      return;
    }

    setIsSaving(true);

    try {
      let coverImageUrl = removeCurrentCover
        ? ""
        : initialCollection?.coverImageUrl || "";
      let coverImageThumbUrl = removeCurrentCover
        ? ""
        : initialCollection?.coverImageThumbUrl || "";

      if (coverFile) {
        const uploaded = await uploadCollectionCover(coverFile, values.title);
        coverImageUrl = uploaded.url;
        coverImageThumbUrl = uploaded.thumbUrl;
      }

      const payload = {
        title: values.title.trim(),
        slug,
        description: values.description.trim(),
        coverImageUrl,
        coverImageThumbUrl,
        coverImageAlt: values.coverImageAlt.trim(),
        isActive: values.isActive,
        isFeatured: values.isFeatured,
        sortOrder: Number(values.sortOrder) || 1,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
      };

      const url =
        mode === "create"
          ? "/api/admin/collections"
          : `/api/admin/collections/${initialCollection?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

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
        setError(data?.message ?? "Não foi possível salvar a coleção.");
        setIsSaving(false);
        return;
      }

      startTransition(() => {
        router.push("/admin/collections");
        router.refresh();
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro de conexão. Tente novamente."
      );
      setIsSaving(false);
    }
  }

  return (
    <>
      <AdminOperationOverlay
        show={showOverlay}
        title={
          isLoadingOrder
            ? "Preparando coleção..."
            : mode === "create"
              ? "Criando coleção..."
              : "Salvando coleção..."
        }
        description={
          isLoadingOrder
            ? "Calculando a próxima posição da coleção."
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
              htmlFor="collection-title"
              className="text-sm font-semibold text-zinc-800"
            >
              Título da coleção
            </label>

            <input
              id="collection-title"
              type="text"
              required
              minLength={2}
              disabled={showOverlay}
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              placeholder="Ex: Dia dos Pais"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-800">
                Slug gerado automaticamente
              </p>

              <p className="mt-2 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm text-zinc-600 ring-1 ring-zinc-200">
                {generatedSlug || "colecao"}
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                O slug será atualizado automaticamente sempre que o título da
                coleção mudar.
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
                  ? "Novas coleções são adicionadas automaticamente ao final da lista."
                  : "Para mudar a posição, use as setas na listagem de coleções."}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="collection-description"
              className="text-sm font-semibold text-zinc-800"
            >
              Descrição
            </label>

            <textarea
              id="collection-description"
              rows={4}
              disabled={showOverlay}
              value={values.description}
              onChange={(event) =>
                updateValue("description", event.target.value)
              }
              placeholder="Conte um pouco sobre essa coleção..."
              className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </div>

          <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4">
            <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                {visibleCoverUrl ? (
                  <Image
                    src={visibleCoverUrl}
                    alt={values.coverImageAlt || values.title || "Capa"}
                    width={440}
                    height={320}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-zinc-400">
                    <ImagePlus className="h-10 w-10" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-800">
                    Capa da coleção
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Envie uma imagem de capa para destacar a coleção no site.
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  disabled={showOverlay}
                  onChange={(event) =>
                    handleCoverChange(event.target.files?.[0] ?? null)
                  }
                  className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="space-y-2">
                  <label
                    htmlFor="collection-cover-alt"
                    className="text-sm font-semibold text-zinc-800"
                  >
                    Texto alternativo da capa
                  </label>

                  <input
                    id="collection-cover-alt"
                    type="text"
                    disabled={showOverlay}
                    value={values.coverImageAlt}
                    onChange={(event) =>
                      updateValue("coverImageAlt", event.target.value)
                    }
                    placeholder="Ex: Topper de biscuit para Dia dos Pais"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                </div>

                {visibleCoverUrl ? (
                  <button
                    type="button"
                    disabled={showOverlay}
                    onClick={handleRemoveCover}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover capa
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
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
                    Coleção ativa
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    Coleções inativas não devem aparecer nas áreas públicas.
                  </span>
                </span>
              </label>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={values.isFeatured}
                  disabled={showOverlay}
                  onChange={(event) =>
                    updateValue("isFeatured", event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)] disabled:cursor-not-allowed disabled:opacity-50"
                />

                <span>
                  <span className="block text-sm font-semibold text-zinc-800">
                    Coleção em destaque
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    Use para destacar coleções especiais na loja.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="collection-starts-at"
                className="text-sm font-semibold text-zinc-800"
              >
                Início da coleção
              </label>

              <input
                id="collection-starts-at"
                type="date"
                disabled={showOverlay}
                value={values.startsAt}
                onChange={(event) =>
                  updateValue("startsAt", event.target.value)
                }
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="collection-ends-at"
                className="text-sm font-semibold text-zinc-800"
              >
                Fim da coleção
              </label>

              <input
                id="collection-ends-at"
                type="date"
                disabled={showOverlay}
                value={values.endsAt}
                onChange={(event) => updateValue("endsAt", event.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>
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
              onClick={() => router.push("/admin/collections")}
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
                  ? "Criar coleção"
                  : "Salvar alterações"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}