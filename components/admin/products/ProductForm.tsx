"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus } from "lucide-react";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import ProductCardPreview from "@/components/admin/products/ProductCardPreview";
import ProductColorsEditor from "@/components/admin/products/ProductColorsEditor";
import type {
  AdminCategoryOption,
  AdminCollectionOption,
  AdminProductDetail,
  ProductFormValues,
} from "@/components/admin/products/types";
import {
  centsToPriceInput,
  normalizePriceInput,
  slugifyPreview,
} from "@/components/admin/products/product-format";

export type ProductFormHandle = {
  save: (options?: { redirect?: boolean }) => Promise<boolean>;
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialProduct?: AdminProductDetail;
  categories: AdminCategoryOption[];
  collections: AdminCollectionOption[];
  previewImageUrlOverride?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  onSaved?: () => void;
};

type CreateProductResponse = {
  message?: string;
  requestId?: string;

  product?: {
    id: number;
  };
};

type ApiErrorResponse = {
  message?: string;
  requestId?: string;
};

function toggleNumberValue(values: number[], value: number) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

function parsePriceInputToCents(value: string) {
  const normalized = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return 0;
  }

  return Math.round(numberValue * 100);
}

function getFirstProductImageUrl(product?: AdminProductDetail) {
  if (!product?.images?.length) {
    return null;
  }

  const sortedImages = [...product.images].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  return sortedImages[0]?.thumbUrl || sortedImages[0]?.url || null;
}

const ProductForm = forwardRef<ProductFormHandle, ProductFormProps>(
  function ProductForm(
    {
      mode,
      initialProduct,
      categories,
      collections,
      previewImageUrlOverride,
      onDirtyChange,
      onSaved,
    },
    ref
  ) {
    const router = useRouter();

    const [values, setValues] = useState<ProductFormValues>({
      name: initialProduct?.name ?? "",
      shortDescription: initialProduct?.shortDescription ?? "",
      description: initialProduct?.description ?? "",
      price: centsToPriceInput(initialProduct?.priceInCents),
      compareAtPrice: centsToPriceInput(initialProduct?.compareAtPriceInCents),
      active: initialProduct?.active ?? true,
      featured: initialProduct?.featured ?? false,
      weightGrams: initialProduct?.weightGrams
        ? String(initialProduct.weightGrams)
        : "",
      heightCm: initialProduct?.heightCm ? String(initialProduct.heightCm) : "",
      widthCm: initialProduct?.widthCm ? String(initialProduct.widthCm) : "",
      lengthCm: initialProduct?.lengthCm ? String(initialProduct.lengthCm) : "",
      categoryIds:
        initialProduct?.categories.map((item) => item.category.id) ?? [],
      collectionIds:
        initialProduct?.collections.map((item) => item.collection.id) ?? [],
      colors:
        initialProduct?.colors.map((color, index) => ({
          id: color.id,
          name: color.name,
          hex: color.hex,
          active: color.active,
          sortOrder: color.sortOrder || index + 1,
        })) ?? [],
    });

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPending, startTransition] = useTransition();

    const initialSnapshotRef = useRef<string | null>(null);

    const showOverlay = isSaving || isPending;

    const valuesSnapshot = useMemo(() => {
      return JSON.stringify({
        ...values,
        colors: values.colors.map((color, index) => ({
          id: color.id,
          name: color.name.trim(),
          hex: color.hex.trim().toUpperCase(),
          active: color.active,
          sortOrder: index + 1,
        })),
      });
    }, [values]);

    useEffect(() => {
      if (initialSnapshotRef.current === null) {
        initialSnapshotRef.current = valuesSnapshot;
      }

      onDirtyChange?.(valuesSnapshot !== initialSnapshotRef.current);
    }, [onDirtyChange, valuesSnapshot]);

    const slugPreview = useMemo(() => {
      return slugifyPreview(values.name) || "produto";
    }, [values.name]);

    useEffect(() => {
      if (images.length === 0) {
        setImagePreviewUrls([]);
        return;
      }

      const urls = images.map((image) => URL.createObjectURL(image));
      setImagePreviewUrls(urls);

      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [images]);

    const previewPriceInCents = useMemo(() => {
      return parsePriceInputToCents(values.price);
    }, [values.price]);

    const previewImageUrl =
      mode === "create"
        ? imagePreviewUrls[0] ?? null
        : previewImageUrlOverride ?? getFirstProductImageUrl(initialProduct);

    function updateValue<K extends keyof ProductFormValues>(
      key: K,
      value: ProductFormValues[K]
    ) {
      setValues((current) => ({
        ...current,
        [key]: value,
      }));
    }

    function updateTextValue(
      key:
        | "name"
        | "shortDescription"
        | "description"
        | "price"
        | "compareAtPrice"
        | "weightGrams"
        | "heightCm"
        | "widthCm"
        | "lengthCm",
      value: string
    ) {
      updateValue(key, value);
    }

    function handleImageChange(fileList: FileList | null) {
      setImages(fileList ? Array.from(fileList) : []);
    }

    const validateForm = useCallback(() => {
      if (values.name.trim().length < 2) {
        return "Informe um nome válido para o produto.";
      }

      if (!values.price.trim()) {
        return "Informe o preço do produto.";
      }

      if (!values.weightGrams.trim()) {
        return "Informe o peso do produto.";
      }

      if (!values.heightCm.trim()) {
        return "Informe a altura do produto.";
      }

      if (!values.widthCm.trim()) {
        return "Informe a largura do produto.";
      }

      if (!values.lengthCm.trim()) {
        return "Informe o comprimento do produto.";
      }

      if (Number(values.weightGrams) <= 0) {
        return "O peso deve ser maior que zero.";
      }

      if (Number(values.heightCm) <= 0) {
        return "A altura deve ser maior que zero.";
      }

      if (Number(values.widthCm) <= 0) {
        return "A largura deve ser maior que zero.";
      }

      if (Number(values.lengthCm) <= 0) {
        return "O comprimento deve ser maior que zero.";
      }

      if (mode === "create" && images.length === 0) {
        return "Envie pelo menos uma imagem do produto.";
      }

      const colorNameSet = new Set<string>();

      for (const color of values.colors) {
        const name = color.name.trim();
        const hex = color.hex.trim();

        if (!name) {
          return "Informe o nome de todas as cores ou remova as linhas vazias.";
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
          return `A cor "${name}" precisa ter um HEX válido, como #F4A7B9.`;
        }

        const normalizedName = name.toLowerCase();

        if (colorNameSet.has(normalizedName)) {
          return `A cor "${name}" está duplicada.`;
        }

        colorNameSet.add(normalizedName);
      }

      return null;
    }, [images.length, mode, values]);

    const createProduct = useCallback(
      async (): Promise<CreateProductResponse> => {
        const formData = new FormData();

        formData.append(
          "name",
          values.name.trim()
        );

        formData.append(
          "shortDescription",
          values.shortDescription.trim()
        );

        formData.append(
          "description",
          values.description.trim()
        );

        formData.append(
          "price",
          values.price.trim()
        );

        formData.append(
          "compareAtPrice",
          values.compareAtPrice.trim()
        );

        formData.append(
          "active",
          String(values.active)
        );

        formData.append(
          "featured",
          String(values.featured)
        );

        formData.append(
          "weightGrams",
          values.weightGrams.trim()
        );

        formData.append(
          "heightCm",
          values.heightCm.trim()
        );

        formData.append(
          "widthCm",
          values.widthCm.trim()
        );

        formData.append(
          "lengthCm",
          values.lengthCm.trim()
        );

        formData.append(
          "categoryIds",
          JSON.stringify(
            values.categoryIds
          )
        );

        formData.append(
          "collectionIds",
          JSON.stringify(
            values.collectionIds
          )
        );

        formData.append(
          "colors",
          JSON.stringify(
            values.colors
          )
        );

        for (
          const image of images
        ) {
          formData.append(
            "images",
            image
          );
        }

        console.log(
          "[PRODUCT_CREATE_CLIENT]",
          {
            message:
              "Enviando produto",

            name:
              values.name.trim(),

            categoryCount:
              values.categoryIds
                .length,

            collectionCount:
              values.collectionIds
                .length,

            colorCount:
              values.colors
                .length,

            images:
              images.map(
                (image) => ({
                  name:
                    image.name,

                  type:
                    image.type,

                  size:
                    image.size,
                })
              ),
          }
        );

        let response: Response;

        try {
          response =
            await fetch(
              "/api/admin/products",
              {
                method:
                  "POST",

                credentials:
                  "include",

                body:
                  formData,
              }
            );
        } catch (error) {
          console.error(
            "[PRODUCT_CREATE_CLIENT_NETWORK_ERROR]",
            error
          );

          throw new Error(
            "Erro de conexão ao criar o produto. Verifique o console e os logs do servidor."
          );
        }

        const contentType =
          response.headers.get(
            "content-type"
          );

        const rawResponse =
          await response.text();

        console.log(
          "[PRODUCT_CREATE_CLIENT_RESPONSE]",
          {
            status:
              response.status,

            statusText:
              response.statusText,

            ok:
              response.ok,

            contentType,

            responsePreview:
              rawResponse.slice(
                0,
                1000
              ),
          }
        );

        let data:
          | CreateProductResponse
          | ApiErrorResponse
          | null = null;

        if (rawResponse) {
          try {
            data =
              JSON.parse(
                rawResponse
              ) as
                | CreateProductResponse
                | ApiErrorResponse;
          } catch (error) {
            console.error(
              "[PRODUCT_CREATE_CLIENT_INVALID_JSON]",
              {
                status:
                  response.status,

                contentType,

                rawResponse:
                  rawResponse.slice(
                    0,
                    2000
                  ),

                error,
              }
            );
          }
        }

        if (!response.ok) {
          const requestId =
            data?.requestId ??
            null;

          console.error(
            "[PRODUCT_CREATE_CLIENT_API_ERROR]",
            {
              status:
                response.status,

              statusText:
                response.statusText,

              requestId,

              data,
            }
          );

          const baseMessage =
            data?.message ??
            `Não foi possível criar o produto. HTTP ${response.status}.`;

          throw new Error(
            requestId
              ? `${baseMessage} Código: ${requestId}`
              : baseMessage
          );
        }

        if (!data) {
          throw new Error(
            "O produto foi enviado, mas a resposta do servidor não pôde ser interpretada."
          );
        }

        return data as CreateProductResponse;
      },
      [images, values]
    );

    const updateProduct = useCallback(async (): Promise<ApiErrorResponse> => {
      const response = await fetch(`/api/admin/products/${initialProduct?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: values.name.trim(),
          shortDescription: values.shortDescription.trim(),
          description: values.description.trim(),
          price: values.price.trim(),
          compareAtPrice: values.compareAtPrice.trim(),
          active: values.active,
          featured: values.featured,
          weightGrams: values.weightGrams.trim(),
          heightCm: values.heightCm.trim(),
          widthCm: values.widthCm.trim(),
          lengthCm: values.lengthCm.trim(),
          categoryIds: values.categoryIds,
          collectionIds: values.collectionIds,
          colors: values.colors,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | ApiErrorResponse
        | null;

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível salvar o produto.");
      }

      return data ?? {};
    }, [initialProduct?.id, values]);

    const saveProduct = useCallback(
      async (options?: { redirect?: boolean }) => {
        const shouldRedirect = options?.redirect ?? true;

        setError(null);

        const validationError = validateForm();

        if (validationError) {
          setError(validationError);
          return false;
        }

        setIsSaving(true);

        try {
          if (mode === "create") {
            const result = await createProduct();

            initialSnapshotRef.current = valuesSnapshot;
            onDirtyChange?.(false);
            onSaved?.();

            startTransition(() => {
              if (result.product?.id) {
                router.push(`/admin/products/${result.product.id}`);
              } else {
                router.push("/admin/products");
              }

              router.refresh();
            });

            return true;
          }

          await updateProduct();

          initialSnapshotRef.current = valuesSnapshot;
          onDirtyChange?.(false);
          onSaved?.();

          if (shouldRedirect) {
            startTransition(() => {
              router.push("/admin/products");
              router.refresh();
            });
          } else {
            router.refresh();
          }

          return true;
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Erro de conexão. Tente novamente."
          );

          return false;
        } finally {
          setIsSaving(false);
        }
      },
      [
        createProduct,
        mode,
        onDirtyChange,
        onSaved,
        router,
        updateProduct,
        validateForm,
        valuesSnapshot,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        save: saveProduct,
      }),
      [saveProduct]
    );

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

      await saveProduct({
        redirect: true,
      });
    }

    return (
      <>
        <AdminOperationOverlay
          show={showOverlay}
          title={
            mode === "create" ? "Criando produto..." : "Salvando produto..."
          }
          description={
            mode === "create"
              ? "Enviando imagens e salvando o produto."
              : "Aguarde enquanto salvamos as alterações."
          }
        />

        <div className="space-y-6">
          <div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para produtos
            </Link>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="grid gap-6">
                <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
                  <div className="space-y-2">
                    <label
                      htmlFor="product-name"
                      className="text-sm font-semibold text-zinc-800"
                    >
                      Nome do produto
                    </label>

                    <input
                      id="product-name"
                      type="text"
                      required
                      minLength={2}
                      disabled={showOverlay}
                      value={values.name}
                      onChange={(event) =>
                        updateTextValue("name", event.target.value)
                      }
                      placeholder="Ex: Topper de chimarrão personalizado"
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                    />
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-800">
                      Slug automático
                    </p>

                    <p className="mt-2 break-all rounded-xl bg-white px-3 py-2 font-mono text-sm text-zinc-600 ring-1 ring-zinc-200">
                      {slugPreview}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      O backend garante que o slug fique único.
                    </p>
                  </div>
                </section>

                <div className="space-y-2">
                  <label
                    htmlFor="product-short-description"
                    className="text-sm font-semibold text-zinc-800"
                  >
                    Descrição curta
                  </label>

                  <input
                    id="product-short-description"
                    type="text"
                    maxLength={300}
                    disabled={showOverlay}
                    value={values.shortDescription}
                    onChange={(event) =>
                      updateTextValue("shortDescription", event.target.value)
                    }
                    placeholder="Resumo curto para cards e SEO."
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="product-description"
                    className="text-sm font-semibold text-zinc-800"
                  >
                    Descrição completa
                  </label>

                  <textarea
                    id="product-description"
                    rows={6}
                    disabled={showOverlay}
                    value={values.description}
                    onChange={(event) =>
                      updateTextValue("description", event.target.value)
                    }
                    placeholder="Detalhes, materiais, prazo, cuidados..."
                    className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                  />
                </div>

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="product-price"
                      className="text-sm font-semibold text-zinc-800"
                    >
                      Preço
                    </label>

                    <input
                      id="product-price"
                      type="text"
                      inputMode="decimal"
                      required
                      disabled={showOverlay}
                      value={values.price}
                      onChange={(event) =>
                        updateTextValue(
                          "price",
                          normalizePriceInput(event.target.value)
                        )
                      }
                      placeholder="Ex: 49,90"
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="product-compare-price"
                      className="text-sm font-semibold text-zinc-800"
                    >
                      Preço comparativo
                    </label>

                    <input
                      id="product-compare-price"
                      type="text"
                      inputMode="decimal"
                      disabled={showOverlay}
                      value={values.compareAtPrice}
                      onChange={(event) =>
                        updateTextValue(
                          "compareAtPrice",
                          normalizePriceInput(event.target.value)
                        )
                      }
                      placeholder="Opcional. Ex: 59,90"
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                    />
                  </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={values.active}
                        disabled={showOverlay}
                        onChange={(event) =>
                          updateValue("active", event.target.checked)
                        }
                        className="mt-1 h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)] disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <span>
                        <span className="block text-sm font-semibold text-zinc-800">
                          Produto ativo
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-zinc-500">
                          Produtos inativos não aparecem no catálogo público.
                        </span>
                      </span>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={values.featured}
                        disabled={showOverlay}
                        onChange={(event) =>
                          updateValue("featured", event.target.checked)
                        }
                        className="mt-1 h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)] disabled:cursor-not-allowed disabled:opacity-50"
                      />

                      <span>
                        <span className="block text-sm font-semibold text-zinc-800">
                          Produto em destaque
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-zinc-500">
                          Use para destacar produtos especiais.
                        </span>
                      </span>
                    </label>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-zinc-800">
                      Peso e dimensões
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Campos obrigatórios para cálculo de frete.
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="product-weight"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Peso (g) *
                      </label>

                      <input
                        id="product-weight"
                        type="number"
                        min={1}
                        step={1}
                        required
                        disabled={showOverlay}
                        value={values.weightGrams}
                        onChange={(event) =>
                          updateTextValue("weightGrams", event.target.value)
                        }
                        placeholder="Ex: 300"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="product-height"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Altura (cm) *
                      </label>

                      <input
                        id="product-height"
                        type="number"
                        min={1}
                        step={1}
                        required
                        disabled={showOverlay}
                        value={values.heightCm}
                        onChange={(event) =>
                          updateTextValue("heightCm", event.target.value)
                        }
                        placeholder="Ex: 10"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="product-width"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Largura (cm) *
                      </label>

                      <input
                        id="product-width"
                        type="number"
                        min={1}
                        step={1}
                        required
                        disabled={showOverlay}
                        value={values.widthCm}
                        onChange={(event) =>
                          updateTextValue("widthCm", event.target.value)
                        }
                        placeholder="Ex: 15"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="product-length"
                        className="text-sm font-semibold text-zinc-800"
                      >
                        Comprimento (cm) *
                      </label>

                      <input
                        id="product-length"
                        type="number"
                        min={1}
                        step={1}
                        required
                        disabled={showOverlay}
                        value={values.lengthCm}
                        onChange={(event) =>
                          updateTextValue("lengthCm", event.target.value)
                        }
                        placeholder="Ex: 20"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                      />
                    </div>
                  </div>
                </section>

                {mode === "create" ? (
                  <section className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--rose-500)] ring-1 ring-zinc-200">
                        <ImagePlus className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-zinc-800">
                            Imagens do produto
                          </p>

                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            Envie pelo menos uma imagem. Imagens grandes serão
                            otimizadas automaticamente. A primeira imagem será
                            usada como imagem principal.
                          </p>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={showOverlay}
                          onChange={(event) =>
                            handleImageChange(event.target.files)
                          }
                          className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        {images.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-xs font-semibold text-zinc-600">
                                {images.length} imagem(ns) selecionada(s).
                              </p>

                              <button
                                type="button"
                                disabled={showOverlay}
                                onClick={() => setImages([])}
                                className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Limpar seleção
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                              {imagePreviewUrls.map((url, index) => (
                                <div
                                  key={url}
                                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                                >
                                  <div className="relative aspect-square">
                                    <Image
                                      src={url}
                                      alt={`Prévia da imagem ${index + 1}`}
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />

                                    {index === 0 ? (
                                      <div className="absolute left-2 top-2 rounded-full bg-[var(--rose-500)] px-2.5 py-1 text-[11px] font-bold text-white shadow">
                                        Principal
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="border-t border-zinc-100 px-3 py-2">
                                    <p className="truncate text-xs font-semibold text-zinc-700">
                                      {images[index]?.name}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-zinc-400">
                                      {images[index]
                                        ? `${(
                                            images[index].size /
                                            1024 /
                                            1024
                                          ).toFixed(2)} MB`
                                        : ""}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center">
                            <ImagePlus className="mx-auto h-8 w-8 text-zinc-300" />
                            <p className="mt-2 text-sm font-semibold text-zinc-500">
                              Nenhuma imagem selecionada
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                              As prévias aparecerão aqui antes de salvar.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                ) : null}

                <ProductColorsEditor
                  colors={values.colors}
                  disabled={showOverlay}
                  onChange={(colors) => updateValue("colors", colors)}
                />

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-800">
                      Categorias
                    </p>

                    <div className="mt-3 grid gap-2">
                      {categories.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                          Nenhuma categoria cadastrada.
                        </p>
                      ) : (
                        categories.map((category) => (
                          <label
                            key={category.id}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-zinc-200"
                          >
                            <input
                              type="checkbox"
                              disabled={showOverlay}
                              checked={values.categoryIds.includes(category.id)}
                              onChange={() =>
                                updateValue(
                                  "categoryIds",
                                  toggleNumberValue(
                                    values.categoryIds,
                                    category.id
                                  )
                                )
                              }
                              className="h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)]"
                            />

                            <span className="text-sm font-medium text-zinc-700">
                              {category.name}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm font-semibold text-zinc-800">
                      Coleções
                    </p>

                    <div className="mt-3 grid gap-2">
                      {collections.length === 0 ? (
                        <p className="text-sm text-zinc-500">
                          Nenhuma coleção cadastrada.
                        </p>
                      ) : (
                        collections.map((collection) => (
                          <label
                            key={collection.id}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-zinc-200"
                          >
                            <input
                              type="checkbox"
                              disabled={showOverlay}
                              checked={values.collectionIds.includes(
                                collection.id
                              )}
                              onChange={() =>
                                updateValue(
                                  "collectionIds",
                                  toggleNumberValue(
                                    values.collectionIds,
                                    collection.id
                                  )
                                )
                              }
                              className="h-4 w-4 rounded border-zinc-300 text-[var(--rose-500)]"
                            />

                            <span className="text-sm font-medium text-zinc-700">
                              {collection.title}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </section>

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={showOverlay}
                    onClick={() => router.push("/admin/products")}
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
                        ? "Criar produto"
                        : "Salvar alterações"}
                  </button>
                </div>
              </div>
            </form>

            <ProductCardPreview
              productId={initialProduct?.id ?? 0}
              name={values.name}
              slug={slugPreview}
              priceInCents={previewPriceInCents}
              imageUrl={previewImageUrl}
              active={values.active}
              featured={values.featured}
            />
          </div>
        </div>
      </>
    );
  }
);

export default ProductForm;