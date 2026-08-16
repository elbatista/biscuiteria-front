"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  ArrowLeft,
  Bold,
  ImagePlus,
  Italic,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type { AdminAboutPageSettings } from "@/components/admin/settings/types";

type AboutSettingsValues = Omit<
  AdminAboutPageSettings,
  "id" | "createdAt" | "updatedAt"
>;

type ImageSlot = "main" | "second" | "third";

type UploadedImageResponse = {
  success: true;
  image: {
    slot: ImageSlot;
    url: string;
    width: number;
    height: number;
  };
};

const EMPTY_VALUES: AboutSettingsValues = {
  authorBadge: "",
  authorTitle: "",
  authorDescription1: "",
  authorDescription2: "",
  authorHighlight: "",

  authorImageMainUrl: null,
  authorImageMainAlt: null,
  authorImageSecondUrl: null,
  authorImageSecondAlt: null,
  authorImageThirdUrl: null,
  authorImageThirdAlt: null,

  brandBadge: "",
  brandTitle: "",
  brandDescription1: "",
  brandDescription2: "",

  makerName: "",
  city: "",
  sinceText: "",

  historyEyebrow: "",
  historyTitle: "",
  historySubtitle: "",
  historyDescription1: "",
  historyDescription2: "",

  metaTitle: "",
  metaDescription: "",
};

const INPUT_CLASS =
  "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-70";

const TEXTAREA_CLASS =
  "min-h-36 w-full resize-y border-0 bg-transparent px-4 py-3 text-sm leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-70";

function normalizeSettings(
  settings: AdminAboutPageSettings
): AboutSettingsValues {
  return {
    authorBadge: settings.authorBadge,
    authorTitle: settings.authorTitle,
    authorDescription1: settings.authorDescription1,
    authorDescription2: settings.authorDescription2,
    authorHighlight: settings.authorHighlight,

    authorImageMainUrl: settings.authorImageMainUrl,
    authorImageMainAlt: settings.authorImageMainAlt,
    authorImageSecondUrl: settings.authorImageSecondUrl,
    authorImageSecondAlt: settings.authorImageSecondAlt,
    authorImageThirdUrl: settings.authorImageThirdUrl,
    authorImageThirdAlt: settings.authorImageThirdAlt,

    brandBadge: settings.brandBadge,
    brandTitle: settings.brandTitle,
    brandDescription1: settings.brandDescription1,
    brandDescription2: settings.brandDescription2,

    makerName: settings.makerName,
    city: settings.city,
    sinceText: settings.sinceText,

    historyEyebrow: settings.historyEyebrow,
    historyTitle: settings.historyTitle,
    historySubtitle: settings.historySubtitle,
    historyDescription1: settings.historyDescription1,
    historyDescription2: settings.historyDescription2,

    metaTitle: settings.metaTitle,
    metaDescription: settings.metaDescription,
  };
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`strong-${match.index}`} className="font-semibold text-zinc-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <em key={`em-${match.index}`}>
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function BasicMarkdownPreview({ value }: { value: string }) {
  const paragraphs = value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return (
      <p className="text-sm italic text-zinc-400">
        O preview aparecerá aqui.
      </p>
    );
  }

  return (
    <div className="space-y-3 text-sm leading-6 text-zinc-600">
      {paragraphs.map((paragraph, paragraphIndex) => {
        const lines = paragraph.split("\n");

        return (
          <p key={`${paragraph.slice(0, 24)}-${paragraphIndex}`}>
            {lines.map((line, lineIndex) => (
              <span key={`${line.slice(0, 24)}-${lineIndex}`}>
                {renderInlineMarkdown(line)}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function insertMarkdown(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  marker: "**" | "*",
  onChange: (value: string) => void
) {
  const textarea = textareaRef.current;

  if (!textarea) {
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end);
  const fallbackText = marker === "**" ? "texto em negrito" : "texto em itálico";
  const content = selectedText || fallbackText;
  const replacement = `${marker}${content}${marker}`;
  const nextValue = value.slice(0, start) + replacement + value.slice(end);

  onChange(nextValue);

  requestAnimationFrame(() => {
    textarea.focus();

    if (selectedText) {
      textarea.setSelectionRange(
        start + marker.length,
        start + marker.length + selectedText.length
      );
    } else {
      textarea.setSelectionRange(
        start + marker.length,
        start + marker.length + fallbackText.length
      );
    }
  });
}

type MarkdownFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
  rows?: number;
};

function MarkdownField({
  label,
  value,
  onChange,
  disabled = false,
  hint,
  rows = 6,
}: MarkdownFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label className="text-sm font-semibold text-zinc-800">{label}</label>
          {hint ? (
            <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => insertMarkdown(textareaRef, value, "**", onChange)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Negrito"
          >
            <Bold className="h-3.5 w-3.5" />
            Negrito
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => insertMarkdown(textareaRef, value, "*", onChange)}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Itálico"
          >
            <Italic className="h-3.5 w-3.5" />
            Itálico
          </button>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white transition focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-50">
        <textarea
          ref={textareaRef}
          rows={rows}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={TEXTAREA_CLASS}
        />

        <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">
            Preview
          </p>
          <BasicMarkdownPreview value={value} />
        </div>
      </div>
    </div>
  );
}

type AboutImageFieldProps = {
  title: string;
  description: string;
  slot: ImageSlot;
  url: string | null;
  alt: string | null;
  disabled: boolean;
  onAltChange: (value: string) => void;
  onUpload: (slot: ImageSlot, file: File) => Promise<void>;
};

function AboutImageField({
  title,
  description,
  slot,
  url,
  alt,
  disabled,
  onAltChange,
  onUpload,
}: AboutImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    await onUpload(slot, file);
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50">
      <div className="relative aspect-[4/5] bg-zinc-100">
        {url ? (
          <Image
            src={url}
            alt={alt || title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-400">
            Nenhuma imagem cadastrada.
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-semibold text-zinc-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ImagePlus className="h-4 w-4" />
          {url ? "Trocar imagem" : "Selecionar imagem"}
        </button>

        <label className="block text-sm font-semibold text-zinc-800">
          Texto alternativo
          <input
            type="text"
            disabled={disabled}
            value={alt ?? ""}
            onChange={(event) => onAltChange(event.target.value)}
            maxLength={300}
            className={INPUT_CLASS}
            placeholder="Descreva brevemente a foto"
          />
        </label>
      </div>
    </div>
  );
}

export default function AboutSettingsForm() {
  const router = useRouter();
  const userHasEditedRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const [values, setValues] = useState<AboutSettingsValues>(EMPTY_VALUES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<ImageSlot | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showOverlay = isLoading || isSaving || uploadingSlot !== null || isPending;

  useEffect(() => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    const controller = new AbortController();

    async function loadSettings() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/settings/about", {
          credentials: "include",
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => null)) as
          | AdminAboutPageSettings
          | { message?: string }
          | null;

        if (controller.signal.aborted || requestId !== loadRequestIdRef.current) {
          return;
        }

        if (!response.ok) {
          setError(
            data && "message" in data && data.message
              ? data.message
              : "Não foi possível carregar a página Sobre."
          );
          return;
        }

        if (!userHasEditedRef.current) {
          setValues(normalizeSettings(data as AdminAboutPageSettings));
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Erro de conexão ao carregar a página Sobre.");
        }
      } finally {
        if (!controller.signal.aborted && requestId === loadRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => controller.abort();
  }, []);

  function updateValue<K extends keyof AboutSettingsValues>(
    key: K,
    value: AboutSettingsValues[K]
  ) {
    userHasEditedRef.current = true;
    setSuccessMessage(null);

    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleImageUpload(slot: ImageSlot, file: File) {
    setError(null);
    setSuccessMessage(null);
    setUploadingSlot(slot);

    try {
      const formData = new FormData();
      formData.append("slot", slot);
      formData.append("file", file);

      const response = await fetch("/api/admin/settings/about/upload-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = (await response.json().catch(() => null)) as
        | UploadedImageResponse
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          data && "message" in data && data.message
            ? data.message
            : "Não foi possível enviar a imagem."
        );
      }

      const uploaded = data as UploadedImageResponse;
      userHasEditedRef.current = true;

      setValues((current) => {
        if (slot === "main") {
          return {
            ...current,
            authorImageMainUrl: uploaded.image.url,
          };
        }

        if (slot === "second") {
          return {
            ...current,
            authorImageSecondUrl: uploaded.image.url,
          };
        }

        return {
          ...current,
          authorImageThirdUrl: uploaded.image.url,
        };
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Erro ao enviar imagem."
      );
    } finally {
      setUploadingSlot(null);
    }
  }

  function validateBeforeSave() {
    const requiredFields: Array<[string, string]> = [
      [values.authorBadge, "Informe a identificação da autora."],
      [values.authorTitle, "Informe o título da autora."],
      [values.authorDescription1, "Informe a primeira descrição da autora."],
      [values.authorDescription2, "Informe a segunda descrição da autora."],
      [values.authorHighlight, "Informe o destaque da autora."],
      [values.brandBadge, "Informe a identificação da Biscuit_eria."],
      [values.brandTitle, "Informe o título da Biscuit_eria."],
      [values.brandDescription1, "Informe a primeira descrição da Biscuit_eria."],
      [values.brandDescription2, "Informe a segunda descrição da Biscuit_eria."],
      [values.makerName, "Informe o nome da autora."],
      [values.city, "Informe a cidade."],
      [values.sinceText, "Informe o texto de início."],
      [values.historyEyebrow, "Informe a identificação da história."],
      [values.historyTitle, "Informe o título da história."],
      [values.historySubtitle, "Informe o subtítulo da história."],
      [values.historyDescription1, "Informe o primeiro texto da história."],
      [values.historyDescription2, "Informe o segundo texto da história."],
      [values.metaTitle, "Informe o título SEO."],
      [values.metaDescription, "Informe a descrição SEO."],
    ];

    const missing = requiredFields.find(([value]) => value.trim().length === 0);

    return missing?.[1] ?? null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateBeforeSave();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      const data = (await response.json().catch(() => null)) as
        | AdminAboutPageSettings
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(
          data && "message" in data && data.message
            ? data.message
            : "Não foi possível salvar a página Sobre."
        );
        return;
      }

      setValues(normalizeSettings(data as AdminAboutPageSettings));
      userHasEditedRef.current = false;
      setSuccessMessage("Página Sobre salva com sucesso.");

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  const overlayTitle = isLoading
    ? "Carregando página Sobre..."
    : uploadingSlot
      ? "Enviando imagem..."
      : "Salvando página Sobre...";

  const overlayDescription = isLoading
    ? "Buscando os textos e fotos cadastrados."
    : uploadingSlot
      ? "Otimizando a foto e enviando para o armazenamento."
      : "Aguarde enquanto salvamos as alterações.";

  return (
    <>
      <AdminOperationOverlay
        show={showOverlay}
        title={overlayTitle}
        description={overlayDescription}
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
            Conteúdo institucional
          </p>

          <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Sobre a autora
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500 sm:text-base">
            Edite os textos, fotos e informações exibidos na página Sobre. Os
            campos com preview aceitam negrito e itálico.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
                Apresentação
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                Apresentação da autora
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Conteúdo principal apresentado no início da página.
              </p>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="text-sm font-semibold text-zinc-800">
                  Identificação
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.authorBadge}
                    onChange={(event) => updateValue("authorBadge", event.target.value)}
                    maxLength={80}
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="text-sm font-semibold text-zinc-800">
                  Título
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.authorTitle}
                    onChange={(event) => updateValue("authorTitle", event.target.value)}
                    maxLength={160}
                    className={INPUT_CLASS}
                  />
                </label>
              </div>

              <MarkdownField
                label="Primeiro texto"
                value={values.authorDescription1}
                onChange={(value) => updateValue("authorDescription1", value)}
                disabled={showOverlay}
              />

              <MarkdownField
                label="Segundo texto"
                value={values.authorDescription2}
                onChange={(value) => updateValue("authorDescription2", value)}
                disabled={showOverlay}
              />

              <MarkdownField
                label="Frase de destaque"
                value={values.authorHighlight}
                onChange={(value) => updateValue("authorHighlight", value)}
                disabled={showOverlay}
                rows={3}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
                Fotos
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                Fotos da autora
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                JPG, PNG ou WebP de até 5 MB. A imagem é otimizada e enviada ao
                Blob assim que você a seleciona; ela só passa a ser usada pela
                página depois de salvar o formulário.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <AboutImageField
                title="Foto principal"
                description="Imagem de maior destaque na apresentação da autora."
                slot="main"
                url={values.authorImageMainUrl}
                alt={values.authorImageMainAlt}
                disabled={showOverlay}
                onUpload={handleImageUpload}
                onAltChange={(value) => updateValue("authorImageMainAlt", value)}
              />

              <AboutImageField
                title="Foto secundária 1"
                description="Primeira imagem de apoio ou bastidor."
                slot="second"
                url={values.authorImageSecondUrl}
                alt={values.authorImageSecondAlt}
                disabled={showOverlay}
                onUpload={handleImageUpload}
                onAltChange={(value) => updateValue("authorImageSecondAlt", value)}
              />

              <AboutImageField
                title="Foto secundária 2"
                description="Segunda imagem de apoio ou bastidor."
                slot="third"
                url={values.authorImageThirdUrl}
                alt={values.authorImageThirdAlt}
                disabled={showOverlay}
                onUpload={handleImageUpload}
                onAltChange={(value) => updateValue("authorImageThirdAlt", value)}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
                Biscuit_eria
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                Sobre a Biscuit_eria
              </h2>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="text-sm font-semibold text-zinc-800">
                  Identificação
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.brandBadge}
                    onChange={(event) => updateValue("brandBadge", event.target.value)}
                    maxLength={80}
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="text-sm font-semibold text-zinc-800">
                  Título
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.brandTitle}
                    onChange={(event) => updateValue("brandTitle", event.target.value)}
                    maxLength={160}
                    className={INPUT_CLASS}
                  />
                </label>
              </div>

              <MarkdownField
                label="Primeiro texto"
                value={values.brandDescription1}
                onChange={(value) => updateValue("brandDescription1", value)}
                disabled={showOverlay}
              />

              <MarkdownField
                label="Segundo texto"
                value={values.brandDescription2}
                onChange={(value) => updateValue("brandDescription2", value)}
                disabled={showOverlay}
              />

              <div className="grid gap-6 md:grid-cols-3">
                <label className="text-sm font-semibold text-zinc-800">
                  Nome da autora
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.makerName}
                    onChange={(event) => updateValue("makerName", event.target.value)}
                    maxLength={120}
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="text-sm font-semibold text-zinc-800">
                  Cidade
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.city}
                    onChange={(event) => updateValue("city", event.target.value)}
                    maxLength={160}
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="text-sm font-semibold text-zinc-800">
                  Desde
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.sinceText}
                    onChange={(event) => updateValue("sinceText", event.target.value)}
                    maxLength={80}
                    className={INPUT_CLASS}
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
                História
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                Nossa história
              </h2>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="text-sm font-semibold text-zinc-800">
                  Identificação
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.historyEyebrow}
                    onChange={(event) => updateValue("historyEyebrow", event.target.value)}
                    maxLength={80}
                    className={INPUT_CLASS}
                  />
                </label>

                <label className="text-sm font-semibold text-zinc-800">
                  Título
                  <input
                    type="text"
                    disabled={showOverlay}
                    value={values.historyTitle}
                    onChange={(event) => updateValue("historyTitle", event.target.value)}
                    maxLength={180}
                    className={INPUT_CLASS}
                  />
                </label>
              </div>

              <MarkdownField
                label="Subtítulo"
                value={values.historySubtitle}
                onChange={(value) => updateValue("historySubtitle", value)}
                disabled={showOverlay}
                rows={3}
              />

              <MarkdownField
                label="Primeiro texto da história"
                value={values.historyDescription1}
                onChange={(value) => updateValue("historyDescription1", value)}
                disabled={showOverlay}
              />

              <MarkdownField
                label="Segundo texto da história"
                value={values.historyDescription2}
                onChange={(value) => updateValue("historyDescription2", value)}
                disabled={showOverlay}
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
                SEO
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                Busca e compartilhamento
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Esses textos serão usados nos metadados da página pública na
                próxima etapa.
              </p>
            </div>

            <div className="mt-6 grid gap-6">
              <label className="text-sm font-semibold text-zinc-800">
                Título SEO
                <input
                  type="text"
                  disabled={showOverlay}
                  value={values.metaTitle}
                  onChange={(event) => updateValue("metaTitle", event.target.value)}
                  maxLength={180}
                  className={INPUT_CLASS}
                />
                <span className="mt-2 block text-xs text-zinc-400">
                  {values.metaTitle.length}/180 caracteres
                </span>
              </label>

              <label className="text-sm font-semibold text-zinc-800">
                Descrição SEO
                <textarea
                  disabled={showOverlay}
                  value={values.metaDescription}
                  onChange={(event) => updateValue("metaDescription", event.target.value)}
                  maxLength={500}
                  rows={4}
                  className={`${INPUT_CLASS} resize-y`}
                />
                <span className="mt-2 block text-xs text-zinc-400">
                  {values.metaDescription.length}/500 caracteres
                </span>
              </label>
            </div>
          </section>

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

          <div className="sticky bottom-4 z-10 flex justify-end">
            <button
              type="submit"
              disabled={showOverlay}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--rose-500)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
