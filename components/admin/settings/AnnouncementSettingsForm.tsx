"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { ArrowLeft, ExternalLink, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type { AdminStoreSettings } from "@/components/admin/settings/types";

type AnnouncementLinkType = "none" | "page" | "collection" | "category" | "custom";

type AnnouncementSettingsValues = {
  announcementEnabled: boolean;
  announcementMessage: string;
  announcementLinkType: AnnouncementLinkType;
  announcementLinkLabel: string;
  announcementPageUrl: string;
  announcementCollectionSlug: string;
  announcementCategorySlug: string;
  announcementCustomUrl: string;
};

type AdminCollectionOption = {
  id: number;
  title: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

type AdminCategoryOption = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

type AdminCollectionsResponse = {
  items: AdminCollectionOption[];
};

type AdminCategoriesResponse = {
  items: AdminCategoryOption[];
};

const pageOptions = [
  { label: "Início", url: "/" },
  { label: "Loja", url: "/loja" },
  { label: "Coleções", url: "/colecoes" },
  { label: "Personalizados", url: "/personalizados" },
  { label: "Sobre", url: "/sobre" },
  { label: "Contato", url: "/contato" },
  { label: "FAQ", url: "/faq" },
  { label: "Trocas e envio", url: "/trocas" },
  { label: "Política de privacidade", url: "/politica" },
  { label: "Termos de uso", url: "/termos" },
];

function isValidCustomUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  );
}

function inferLinkType(url: string | null | undefined): AnnouncementLinkType {
  if (!url?.trim()) {
    return "none";
  }

  if (pageOptions.some((option) => option.url === url)) {
    return "page";
  }

  if (url.startsWith("/colecoes/")) {
    return "collection";
  }

  if (url.startsWith("/loja?categoria=")) {
    return "category";
  }

  return "custom";
}

function getInitialPageUrl(url: string | null | undefined) {
  if (!url) {
    return "/loja";
  }

  return pageOptions.some((option) => option.url === url) ? url : "/loja";
}

function getInitialCollectionSlug(url: string | null | undefined) {
  if (!url?.startsWith("/colecoes/")) {
    return "";
  }

  return decodeURIComponent(url.replace("/colecoes/", "").trim());
}

function getInitialCategorySlug(url: string | null | undefined) {
  if (!url?.startsWith("/loja?categoria=")) {
    return "";
  }

  return decodeURIComponent(url.replace("/loja?categoria=", "").trim());
}

function buildAnnouncementLinkUrl(values: AnnouncementSettingsValues) {
  if (values.announcementLinkType === "none") {
    return "";
  }

  if (values.announcementLinkType === "page") {
    return values.announcementPageUrl;
  }

  if (values.announcementLinkType === "collection") {
    return `/colecoes/${encodeURIComponent(values.announcementCollectionSlug)}`;
  }

  if (values.announcementLinkType === "category") {
    return `/loja?categoria=${encodeURIComponent(values.announcementCategorySlug)}`;
  }

  return values.announcementCustomUrl.trim();
}

function sortCollections(collections: AdminCollectionOption[]) {
  return [...collections].sort((a, b) => {
    const orderDiff = a.sortOrder - b.sortOrder;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.title.localeCompare(b.title, "pt-BR");
  });
}

function sortCategories(categories: AdminCategoryOption[]) {
  return [...categories].sort((a, b) => {
    const orderDiff = a.sortOrder - b.sortOrder;

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.name.localeCompare(b.name, "pt-BR");
  });
}

export default function AnnouncementSettingsForm() {
  const router = useRouter();

  const [values, setValues] = useState<AnnouncementSettingsValues>({
    announcementEnabled: false,
    announcementMessage: "",
    announcementLinkType: "none",
    announcementLinkLabel: "",
    announcementPageUrl: "/loja",
    announcementCollectionSlug: "",
    announcementCategorySlug: "",
    announcementCustomUrl: "",
  });

  const [collections, setCollections] = useState<AdminCollectionOption[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showOverlay = isLoading || isLoadingDestinations || isSaving || isPending;

  const activeCollections = useMemo(() => {
    return sortCollections(collections.filter((collection) => collection.isActive));
  }, [collections]);

  const activeCategories = useMemo(() => {
    return sortCategories(categories.filter((category) => category.isActive));
  }, [categories]);

  const previewLinkUrl = useMemo(() => {
    return buildAnnouncementLinkUrl(values);
  }, [values]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setIsLoadingDestinations(true);
      setError(null);

      try {
        const [settingsResponse, collectionsResponse, categoriesResponse] =
          await Promise.all([
            fetch("/api/admin/settings", {
              credentials: "include",
            }),
            fetch("/api/admin/collections?page=1&pageSize=100&active=true", {
              credentials: "include",
            }),
            fetch("/api/admin/categories?page=1&pageSize=100&active=true", {
              credentials: "include",
            }),
          ]);

        const settingsData = (await settingsResponse.json().catch(() => null)) as
          | AdminStoreSettings
          | { message?: string }
          | null;

        const collectionsData = (await collectionsResponse
          .json()
          .catch(() => null)) as AdminCollectionsResponse | { message?: string } | null;

        const categoriesData = (await categoriesResponse
          .json()
          .catch(() => null)) as AdminCategoriesResponse | { message?: string } | null;

        if (!settingsResponse.ok) {
          setError(
            settingsData && "message" in settingsData && settingsData.message
              ? settingsData.message
              : "Não foi possível carregar o aviso."
          );
          return;
        }

        if (!collectionsResponse.ok) {
          setError(
            collectionsData &&
              "message" in collectionsData &&
              collectionsData.message
              ? collectionsData.message
              : "Não foi possível carregar as coleções."
          );
          return;
        }

        if (!categoriesResponse.ok) {
          setError(
            categoriesData && "message" in categoriesData && categoriesData.message
              ? categoriesData.message
              : "Não foi possível carregar as categorias."
          );
          return;
        }

        const settings = settingsData as AdminStoreSettings;
        const loadedCollections = sortCollections(
          (collectionsData as AdminCollectionsResponse).items ?? []
        );
        const loadedCategories = sortCategories(
          (categoriesData as AdminCategoriesResponse).items ?? []
        );

        const linkType = inferLinkType(settings.announcementLinkUrl);

        setCollections(loadedCollections);
        setCategories(loadedCategories);

        setValues({
          announcementEnabled: settings.announcementEnabled,
          announcementMessage: settings.announcementMessage ?? "",
          announcementLinkType: linkType,
          announcementLinkLabel: settings.announcementLinkLabel ?? "",
          announcementPageUrl: getInitialPageUrl(settings.announcementLinkUrl),
          announcementCollectionSlug: getInitialCollectionSlug(
            settings.announcementLinkUrl
          ),
          announcementCategorySlug: getInitialCategorySlug(
            settings.announcementLinkUrl
          ),
          announcementCustomUrl:
            linkType === "custom" ? settings.announcementLinkUrl ?? "" : "",
        });
      } catch {
        setError("Erro de conexão ao carregar aviso.");
      } finally {
        setIsLoading(false);
        setIsLoadingDestinations(false);
      }
    }

    loadData();
  }, []);

  function updateValue<K extends keyof AnnouncementSettingsValues>(
    key: K,
    value: AnnouncementSettingsValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleLinkTypeChange(linkType: AnnouncementLinkType) {
    setValues((current) => {
      const nextValues: AnnouncementSettingsValues = {
        ...current,
        announcementLinkType: linkType,
      };

      if (linkType === "none") {
        nextValues.announcementLinkLabel = "";
      }

      if (linkType === "page" && !nextValues.announcementPageUrl) {
        nextValues.announcementPageUrl = "/loja";
      }

      if (
        linkType === "collection" &&
        !nextValues.announcementCollectionSlug &&
        activeCollections[0]
      ) {
        nextValues.announcementCollectionSlug = activeCollections[0].slug;
      }

      if (
        linkType === "category" &&
        !nextValues.announcementCategorySlug &&
        activeCategories[0]
      ) {
        nextValues.announcementCategorySlug = activeCategories[0].slug;
      }

      return nextValues;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      values.announcementEnabled &&
      values.announcementMessage.trim().length < 2
    ) {
      setError("Informe a mensagem do aviso.");
      return;
    }

    if (values.announcementLinkType !== "none") {
      if (!values.announcementLinkLabel.trim()) {
        setError("Informe o texto do link do aviso.");
        return;
      }

      if (
        values.announcementLinkType === "page" &&
        !values.announcementPageUrl.trim()
      ) {
        setError("Escolha uma página ou seção do site.");
        return;
      }

      if (
        values.announcementLinkType === "collection" &&
        !values.announcementCollectionSlug.trim()
      ) {
        setError("Escolha uma coleção.");
        return;
      }

      if (
        values.announcementLinkType === "category" &&
        !values.announcementCategorySlug.trim()
      ) {
        setError("Escolha uma categoria.");
        return;
      }

      if (
        values.announcementLinkType === "custom" &&
        !isValidCustomUrl(values.announcementCustomUrl)
      ) {
        setError("Use uma URL começando com /, http:// ou https://.");
        return;
      }
    }

    const announcementLinkUrl = buildAnnouncementLinkUrl(values);

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings/announcement", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          announcementEnabled: values.announcementEnabled,
          announcementMessage: values.announcementMessage.trim(),
          announcementLinkLabel:
            values.announcementLinkType === "none"
              ? ""
              : values.announcementLinkLabel.trim(),
          announcementLinkUrl,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(data?.message ?? "Não foi possível salvar o aviso.");
        setIsSaving(false);
        return;
      }

      setSuccessMessage("Aviso salvo com sucesso.");

      startTransition(() => {
        router.refresh();
      });

      setIsSaving(false);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setIsSaving(false);
    }
  }

  return (
    <>
      <AdminOperationOverlay
        show={showOverlay}
        title={isLoading ? "Carregando aviso..." : "Salvando aviso..."}
        description={
          isLoading || isLoadingDestinations
            ? "Buscando as configurações atuais e os destinos disponíveis."
            : "Aguarde enquanto salvamos as alterações."
        }
      />

      <div className="space-y-6">
        <div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para configurações
          </Link>
        </div>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
            Aviso
          </p>

          <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Aviso do site
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Configure a barra de anúncio exibida no topo da loja pública e escolha
            para onde o link deve levar.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={values.announcementEnabled}
                  disabled={showOverlay}
                  onChange={(event) =>
                    updateValue("announcementEnabled", event.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)] disabled:cursor-not-allowed disabled:opacity-50"
                />

                <span>
                  <span className="block text-sm font-semibold text-zinc-800">
                    Exibir aviso no site
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    Quando ativo, o aviso aparece na barra superior da loja.
                  </span>
                </span>
              </label>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="announcement-message"
                className="text-sm font-semibold text-zinc-800"
              >
                Mensagem do aviso
              </label>

              <input
                id="announcement-message"
                type="text"
                disabled={showOverlay}
                value={values.announcementMessage}
                onChange={(event) =>
                  updateValue("announcementMessage", event.target.value)
                }
                placeholder="Ex: Encomendas para o Dia dos Pais abertas!"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />
            </div>

            <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--rose-500)] ring-1 ring-zinc-200">
                  <Link2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Link do aviso
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Escolha um destino pronto para evitar erros de URL.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  { value: "none", label: "Sem link" },
                  { value: "page", label: "Página / seção" },
                  { value: "collection", label: "Coleção" },
                  { value: "category", label: "Categoria" },
                  { value: "custom", label: "URL externa" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={[
                      "cursor-pointer rounded-2xl border p-4 text-sm font-semibold transition",
                      values.announcementLinkType === option.value
                        ? "border-rose-200 bg-white text-[var(--rose-500)] shadow-sm"
                        : "border-zinc-200 bg-white/70 text-zinc-600 hover:bg-white",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="announcementLinkType"
                      value={option.value}
                      disabled={showOverlay}
                      checked={values.announcementLinkType === option.value}
                      onChange={() =>
                        handleLinkTypeChange(option.value as AnnouncementLinkType)
                      }
                      className="sr-only"
                    />

                    {option.label}
                  </label>
                ))}
              </div>

              {values.announcementLinkType !== "none" ? (
                <div className="mt-5 grid gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="announcement-link-label"
                      className="text-sm font-semibold text-zinc-800"
                    >
                      Texto do link
                    </label>

                    <input
                      id="announcement-link-label"
                      type="text"
                      disabled={showOverlay}
                      value={values.announcementLinkLabel}
                      onChange={(event) =>
                        updateValue("announcementLinkLabel", event.target.value)
                      }
                      placeholder="Ex: Ver coleção"
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                    />
                  </div>

                  {values.announcementLinkType === "page" ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="announcement-page-url"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Página ou seção
                      </label>

                      <select
                        id="announcement-page-url"
                        disabled={showOverlay}
                        value={values.announcementPageUrl}
                        onChange={(event) =>
                          updateValue("announcementPageUrl", event.target.value)
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      >
                        {pageOptions.map((option) => (
                          <option key={option.url} value={option.url}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {values.announcementLinkType === "collection" ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="announcement-collection"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Coleção
                      </label>

                      <select
                        id="announcement-collection"
                        disabled={showOverlay || activeCollections.length === 0}
                        value={values.announcementCollectionSlug}
                        onChange={(event) =>
                          updateValue(
                            "announcementCollectionSlug",
                            event.target.value
                          )
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      >
                        <option value="">
                          {activeCollections.length === 0
                            ? "Nenhuma coleção ativa encontrada"
                            : "Escolha uma coleção"}
                        </option>

                        {activeCollections.map((collection) => (
                          <option key={collection.id} value={collection.slug}>
                            {collection.title}
                          </option>
                        ))}
                      </select>

                      <p className="text-xs leading-5 text-zinc-500">
                        O link será gerado como{" "}
                        <code>/colecoes/{values.announcementCollectionSlug || "slug"}</code>.
                      </p>
                    </div>
                  ) : null}

                  {values.announcementLinkType === "category" ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="announcement-category"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Categoria
                      </label>

                      <select
                        id="announcement-category"
                        disabled={showOverlay || activeCategories.length === 0}
                        value={values.announcementCategorySlug}
                        onChange={(event) =>
                          updateValue("announcementCategorySlug", event.target.value)
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      >
                        <option value="">
                          {activeCategories.length === 0
                            ? "Nenhuma categoria ativa encontrada"
                            : "Escolha uma categoria"}
                        </option>

                        {activeCategories.map((category) => (
                          <option key={category.id} value={category.slug}>
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <p className="text-xs leading-5 text-zinc-500">
                        O link será gerado como{" "}
                        <code>
                          /loja?categoria=
                          {values.announcementCategorySlug || "slug"}
                        </code>
                        .
                      </p>
                    </div>
                  ) : null}

                  {values.announcementLinkType === "custom" ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="announcement-custom-url"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        URL personalizada ou externa
                      </label>

                      <input
                        id="announcement-custom-url"
                        type="text"
                        disabled={showOverlay}
                        value={values.announcementCustomUrl}
                        onChange={(event) =>
                          updateValue("announcementCustomUrl", event.target.value)
                        }
                        placeholder="Ex: https://instagram.com/biscuiteria ou /loja?colecao=natal"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      />

                      <p className="text-xs leading-5 text-zinc-500">
                        Use URL interna começando com <code>/</code> ou URL
                        externa começando com <code>https://</code>.
                      </p>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                      URL final
                    </p>

                    <p className="mt-2 break-all font-mono text-sm text-zinc-700">
                      {previewLinkUrl || "sem link"}
                    </p>
                  </div>
                </div>
              ) : null}
            </section>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-800">Prévia</p>

              <div className="mt-3 rounded-2xl bg-[var(--green-500)] px-4 py-3 text-sm font-semibold text-white">
                {values.announcementMessage.trim() ||
                  "Sua mensagem aparecerá aqui."}

                {values.announcementLinkType !== "none" &&
                values.announcementLinkLabel.trim() ? (
                  <span className="ml-2 inline-flex items-center gap-1 underline">
                    {values.announcementLinkLabel.trim()}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                ) : null}
              </div>
            </div>

            {successMessage ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={showOverlay}
                className="rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Salvando..." : "Salvar aviso"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}