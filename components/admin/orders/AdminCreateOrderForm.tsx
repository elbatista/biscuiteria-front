"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  Loader2,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  MapPin,
} from "lucide-react";

import {
  formatCpf,
  formatPhoneBR,
  formatZipCode,
  onlyDigits,
} from "@/lib/checkout/formatters";

import {
  getFieldError,
  initialCheckoutForm,
  type CheckoutFormState,
  type FieldErrors,
} from "@/lib/checkout/validators";

import {
  formatOrderCurrency,
} from "@/lib/admin/orders/order-format";

import { useRouter } from "next/navigation";

type AdminOrderProductColor = {
  id: number;
  name: string;
  hex: string | null;
  sortOrder: number;
};

type AdminOrderProductImage = {
  id: number;
  url: string;
  thumbUrl: string | null;
  altText: string | null;
};

type AdminOrderProduct = {
  id: number;
  name: string;
  sku: string | null;
  priceInCents: number;
  currency: string;
  image: AdminOrderProductImage | null;
  colors: AdminOrderProductColor[];
};

type AdminOrderProductsResponse = {
  products: AdminOrderProduct[];
};

type SelectedOrderItem = {
  key: string;

  productId: number;
  productName: string;
  sku: string | null;
  imageUrl: string | null;

  unitPriceInCents: number;

  selectedColorId: number | null;
  selectedColorName: string | null;
  selectedColorHex: string | null;

  quantity: number;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

function buildItemKey(
  productId: number,
  selectedColorId: number | null
) {
  return [
    productId,
    selectedColorId ?? "no-color",
  ].join(":");
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  error,
  disabled = false,
  autoComplete,
  maxLength,
  inputRef,
}: {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  onBlur?: () => void;

  placeholder?: string;
  type?: string;

  required?: boolean;

  error?: string;

  disabled?: boolean;

  autoComplete?: string;
  maxLength?: number;

  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-zinc-700">
        {label}

        {required ? (
          <span className="ml-1 text-red-500">
            *
          </span>
        ) : null}
      </span>

      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={
          error ? "true" : "false"
        }
        className={[
          "min-h-12 rounded-2xl border bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
            : "border-zinc-200 focus:border-[var(--green-500)] focus:ring-4 focus:ring-[var(--green-50)]",
          disabled
            ? "cursor-not-allowed bg-zinc-50 text-zinc-500"
            : "",
        ].join(" ")}
      />

      {error ? (
        <span className="text-xs font-medium text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function ProductImage({
  product,
}: {
  product: AdminOrderProduct;
}) {
  const imageUrl =
    product.image?.thumbUrl ||
    product.image?.url ||
    null;

  if (!imageUrl) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
        <Package className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={
          product.image
            ?.altText ||
          product.name
        }
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function SelectedItemImage({
  item,
}: {
  item: SelectedOrderItem;
}) {
  if (!item.imageUrl) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
        <Package className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.imageUrl}
        alt={item.productName}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default function AdminCreateOrderForm() {

  const router = useRouter();

  const numberInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [products, setProducts] =
    useState<
      AdminOrderProduct[]
    >([]);

  const [items, setItems] =
    useState<
      SelectedOrderItem[]
    >([]);

  const [search, setSearch] =
    useState("");

  const [
    selectedProductId,
    setSelectedProductId,
  ] =
    useState<
      number | null
    >(null);

  const [
    selectedColorId,
    setSelectedColorId,
  ] =
    useState<
      number | null
    >(null);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadingZipCode,
    setLoadingZipCode,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    addError,
    setAddError,
  ] =
    useState<
      string | null
    >(null);

  const [
    form,
    setForm,
  ] =
    useState<CheckoutFormState>(
      initialCheckoutForm
    );

  const [
    errors,
    setErrors,
  ] =
    useState<FieldErrors>({});

  const [
    sameRecipientName,
    setSameRecipientName,
  ] = useState(true);

  const [
    sendCreationEmails,
    setSendCreationEmails,
    ] = useState(true);

    const [
    isSubmitting,
    setIsSubmitting,
    ] = useState(false);

    const [
    submitError,
    setSubmitError,
    ] = useState<string | null>(
    null
    );

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await fetch(
            "/api/admin/orders/products",
            {
              credentials:
                "include",
            }
          );

        const data =
          (await response
            .json()
            .catch(
              () => null
            )) as
            | AdminOrderProductsResponse
            | {
                error?: string;
              }
            | null;

        if (!response.ok) {
          throw new Error(
            data &&
              "error" in
                data &&
              data.error
              ? data.error
              : "Não foi possível carregar os produtos."
          );
        }

        setProducts(
          (
            data as AdminOrderProductsResponse
          ).products ?? []
        );
      } catch (
        error
      ) {
        setError(
          error instanceof
            Error
            ? error.message
            : "Não foi possível carregar os produtos."
        );
      } finally {
        setIsLoading(
          false
        );
      }
    }

    loadProducts();
  }, []);

  const filteredProducts =
    useMemo(() => {
      const normalized =
        search
          .trim()
          .toLowerCase();

      if (
        !normalized
      ) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(
              normalized
            ) ||
          Boolean(
            product.sku
              ?.toLowerCase()
              .includes(
                normalized
              )
          )
      );
    }, [
      products,
      search,
    ]);

  const selectedProduct =
    useMemo(() => {
      if (
        selectedProductId ===
        null
      ) {
        return null;
      }

      return (
        products.find(
          (product) =>
            product.id ===
            selectedProductId
        ) ?? null
      );
    }, [
      products,
      selectedProductId,
    ]);

  const subtotalInCents =
    useMemo(() => {
      return items.reduce(
        (
          total,
          item
        ) =>
          total +
          item.unitPriceInCents *
            item.quantity,
        0
      );
    }, [items]);

  const totalItems =
    useMemo(() => {
      return items.reduce(
        (
          total,
          item
        ) =>
          total +
          item.quantity,
        0
      );
    }, [items]);

  const formIsValid =
    useMemo(() => {
      const requiredFields: Array<
        keyof CheckoutFormState
      > = [
        "name",
        "email",
        "phone",
        "recipientName",
        "zipCode",
        "street",
        "number",
        "neighborhood",
        "city",
        "state",
      ];

      const hasRequiredError =
        requiredFields.some(
          (key) =>
            Boolean(
              getFieldError(
                key,
                form[key]
              )
            )
        );

      const documentError =
        getFieldError(
          "document",
          form.document
        );

      const notesError =
        getFieldError(
          "customerNotes",
          form.customerNotes
        );

      return (
        !hasRequiredError &&
        !documentError &&
        !notesError
      );
    }, [form]);

  const orderIsReady =
    items.length > 0 &&
    formIsValid;

  function setField<
    K extends keyof CheckoutFormState,
  >(
    key: K,
    value:
      CheckoutFormState[K]
  ) {
    let nextValue =
      value;

    if (
      key === "zipCode"
    ) {
      nextValue =
        formatZipCode(
          String(value)
        ) as CheckoutFormState[K];
    }

    if (
      key === "phone"
    ) {
      nextValue =
        formatPhoneBR(
          String(value)
        ) as CheckoutFormState[K];
    }

    if (
      key === "document"
    ) {
      nextValue =
        formatCpf(
          String(value)
        ) as CheckoutFormState[K];
    }

    if (
      key === "state"
    ) {
      nextValue =
        String(value)
          .toUpperCase()
          .slice(
            0,
            2
          ) as CheckoutFormState[K];
    }

    setForm(
      (current) => {
        const nextForm =
          {
            ...current,

            [key]:
              nextValue,
          };

        if (
          key ===
            "name" &&
          sameRecipientName
        ) {
          nextForm.recipientName =
            String(
              nextValue
            );
        }

        return nextForm;
      }
    );

    setErrors(
      (current) => {
        const nextErrors =
          {
            ...current,

            [key]:
              undefined,
          };

        if (
          key ===
            "name" &&
          sameRecipientName
        ) {
          nextErrors.recipientName =
            undefined;
        }

        return nextErrors;
      }
    );
  }

  function validateField(
    key: keyof CheckoutFormState
  ) {
    const message =
      getFieldError(
        key,
        form[key]
      );

    setErrors(
      (current) => ({
        ...current,

        [key]:
          message,
      })
    );

    return !message;
  }

  function validateEntireForm() {
    const fieldsToValidate: Array<
        keyof CheckoutFormState
    > = [
        "name",
        "email",
        "phone",
        "document",
        "recipientName",
        "zipCode",
        "street",
        "number",
        "complement",
        "neighborhood",
        "city",
        "state",
        "customerNotes",
    ];

    const nextErrors: FieldErrors =
        {};

    let firstError:
        | string
        | null = null;

    for (const key of fieldsToValidate) {
        const message =
        getFieldError(
            key,
            form[key]
        );

        if (message) {
        nextErrors[key] =
            message;

        if (!firstError) {
            firstError =
            message;
        }
        }
    }

    setErrors(nextErrors);

    return {
        valid:
        !firstError,
        firstError,
    };
    }

  function handleSameRecipientNameChange(
    checked: boolean
  ) {
    setSameRecipientName(
      checked
    );

    if (checked) {
      setForm(
        (current) => ({
          ...current,

          recipientName:
            current.name,
        })
      );

      setErrors(
        (current) => ({
          ...current,

          recipientName:
            undefined,
        })
      );
    }
  }

  async function handleZipCodeBlur() {
    const zipCodeDigits =
      onlyDigits(
        form.zipCode
      );

    validateField(
      "zipCode"
    );

    if (
      zipCodeDigits.length !==
      8
    ) {
      return;
    }

    setLoadingZipCode(
      true
    );

    try {
      const response =
        await fetch(
          `https://viacep.com.br/ws/${zipCodeDigits}/json/`
        );

      const data =
        (await response.json()) as ViaCepResponse;

      if (
        !response.ok ||
        data.erro
      ) {
        setErrors(
          (current) => ({
            ...current,

            zipCode:
              "Não foi possível localizar esse CEP.",
          })
        );

        return;
      }

      setForm(
        (current) => ({
          ...current,

          zipCode:
            formatZipCode(
              data.cep ||
                zipCodeDigits
            ),

          street:
            data.logradouro ||
            current.street,

          complement:
            current.complement ||
            data.complemento ||
            "",

          neighborhood:
            data.bairro ||
            current.neighborhood,

          city:
            data.localidade ||
            current.city,

          state:
            (
              data.uf ||
              current.state
            ).toUpperCase(),
        })
      );

      setErrors(
        (current) => ({
          ...current,

          zipCode:
            undefined,

          street:
            undefined,

          neighborhood:
            undefined,

          city:
            undefined,

          state:
            undefined,
        })
      );

      window.setTimeout(
        () => {
          numberInputRef.current?.focus();
        },
        50
      );
    } catch {
      setErrors(
        (current) => ({
          ...current,

          zipCode:
            "Não foi possível buscar o CEP agora. Tente novamente.",
        })
      );
    } finally {
      setLoadingZipCode(
        false
      );
    }
  }

  function selectProduct(
    product: AdminOrderProduct
  ) {
    setSelectedProductId(
      product.id
    );

    setSelectedColorId(
      null
    );

    setQuantity(1);
    setAddError(null);
  }

  function clearSelection() {
    setSelectedProductId(
      null
    );

    setSelectedColorId(
      null
    );

    setQuantity(1);
    setAddError(null);
  }

  function addItem() {
    if (
      !selectedProduct
    ) {
      setAddError(
        "Selecione um produto."
      );

      return;
    }

    const requiresColor =
      selectedProduct
        .colors.length >
      0;

    if (
      requiresColor &&
      !selectedColorId
    ) {
      setAddError(
        "Selecione uma cor para este produto."
      );

      return;
    }

    const selectedColor =
      selectedColorId
        ? selectedProduct.colors.find(
            (color) =>
              color.id ===
              selectedColorId
          ) ?? null
        : null;

    const itemKey =
      buildItemKey(
        selectedProduct.id,

        selectedColor?.id ??
          null
      );

    setItems(
      (
        currentItems
      ) => {
        const existingItem =
          currentItems.find(
            (item) =>
              item.key ===
              itemKey
          );

        if (
          existingItem
        ) {
          return currentItems.map(
            (item) =>
              item.key ===
              itemKey
                ? {
                    ...item,

                    quantity:
                      item.quantity +
                      quantity,
                  }
                : item
          );
        }

        return [
          ...currentItems,

          {
            key:
              itemKey,

            productId:
              selectedProduct.id,

            productName:
              selectedProduct.name,

            sku:
              selectedProduct.sku,

            imageUrl:
              selectedProduct
                .image
                ?.thumbUrl ||
              selectedProduct
                .image
                ?.url ||
              null,

            unitPriceInCents:
              selectedProduct
                .priceInCents,

            selectedColorId:
              selectedColor?.id ??
              null,

            selectedColorName:
              selectedColor?.name ??
              null,

            selectedColorHex:
              selectedColor?.hex ??
              null,

            quantity,
          },
        ];
      }
    );

    clearSelection();
  }

  function updateItemQuantity(
    key: string,
    nextQuantity: number
  ) {
    if (
      nextQuantity <
      1
    ) {
      return;
    }

    setItems(
      (
        currentItems
      ) =>
        currentItems.map(
          (item) =>
            item.key ===
            key
              ? {
                  ...item,

                  quantity:
                    nextQuantity,
                }
              : item
        )
    );
  }

  function removeItem(
    key: string
  ) {
    setItems(
      (
        currentItems
      ) =>
        currentItems.filter(
          (item) =>
            item.key !==
            key
        )
    );
  }


  async function handleCreateOrder() {
  if (isSubmitting) {
    return;
  }

  setSubmitError(null);

  if (items.length === 0) {
    setSubmitError(
      "Adicione pelo menos um produto ao pedido."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  const validation =
    validateEntireForm();

  if (!validation.valid) {
    setSubmitError(
      validation.firstError ||
        "Revise os dados do pedido."
    );

    return;
  }

  setIsSubmitting(true);

  try {
    const response =
      await fetch(
        "/api/admin/orders",
        {
          method: "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              customer: {
                name:
                  form.name.trim(),

                email:
                  form.email.trim(),

                phone:
                  onlyDigits(
                    form.phone
                  ),

                document:
                  form.document.trim()
                    ? onlyDigits(
                        form.document
                      )
                    : undefined,
              },

              shippingAddress: {
                recipientName:
                  form.recipientName.trim(),

                zipCode:
                  onlyDigits(
                    form.zipCode
                  ),

                street:
                  form.street.trim(),

                number:
                  form.number.trim(),

                complement:
                  form.complement.trim()
                    ? form.complement.trim()
                    : undefined,

                neighborhood:
                  form.neighborhood.trim(),

                city:
                  form.city.trim(),

                state:
                  form.state
                    .trim()
                    .toUpperCase(),

                country:
                  "BR",
              },

              customerNotes:
                form.customerNotes.trim()
                  ? form.customerNotes.trim()
                  : undefined,

              items:
                items.map(
                  (item) => ({
                    productId:
                      item.productId,

                    quantity:
                      item.quantity,

                    selectedColorId:
                      item.selectedColorId,
                  })
                ),

              sendCreationEmails,
            }),
        }
      );

    const result =
      await response
        .json()
        .catch(
          () => null
        );

    if (!response.ok) {
      throw new Error(
        result?.error ||
          "Não foi possível criar o pedido."
      );
    }

    const orderId =
      result?.order?.id;

    if (!orderId) {
      throw new Error(
        "O pedido foi criado, mas não foi possível identificar seu ID."
      );
    }

    router.push(
      `/admin/orders/${orderId}`
    );

    router.refresh();
  } catch (error) {
    console.error(
      "ADMIN_CREATE_ORDER_FORM_ERROR",
      error
    );

    setSubmitError(
      error instanceof Error
        ? error.message
        : "Não foi possível criar o pedido."
    );
  } finally {
    setIsSubmitting(
      false
    );
  }
}

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        {/* PRODUTOS */}
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--green-50)] text-[var(--green-500)]">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-950">
                Produtos
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Busque um produto, selecione a variação quando necessário e
                adicione ao pedido.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="product-search"
              className="text-sm font-semibold text-zinc-700"
            >
              Buscar produto
            </label>

            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Nome ou SKU..."
                className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--green-500)] focus:ring-4 focus:ring-[var(--green-50)]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              Carregando produtos...
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!isLoading &&
          !error ? (
            <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {filteredProducts.length ===
              0 ? (
                <div className="rounded-2xl bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                  Nenhum produto encontrado.
                </div>
              ) : (
                filteredProducts.map(
                  (product) => {
                    const isSelected =
                      product.id ===
                      selectedProductId;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          selectProduct(
                            product
                          )
                        }
                        className={[
                          "flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition",
                          isSelected
                            ? "border-[var(--green-500)] bg-[var(--green-50)]"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
                        ].join(
                          " "
                        )}
                      >
                        <ProductImage
                          product={
                            product
                          }
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-zinc-900">
                                {
                                  product.name
                                }
                              </p>

                              {product.sku ? (
                                <p className="mt-1 text-xs text-zinc-400">
                                  SKU:{" "}
                                  {
                                    product.sku
                                  }
                                </p>
                              ) : null}
                            </div>

                            <p className="shrink-0 text-sm font-bold text-zinc-900">
                              {formatOrderCurrency(
                                product.priceInCents
                              )}
                            </p>
                          </div>

                          {product.colors.length >
                          0 ? (
                            <p className="mt-2 text-xs text-zinc-500">
                              {
                                product.colors
                                  .length
                              }{" "}
                              {product.colors
                                .length ===
                              1
                                ? "cor disponível"
                                : "cores disponíveis"}
                            </p>
                          ) : null}
                        </div>

                        {isSelected ? (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--green-500)] text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : null}
                      </button>
                    );
                  }
                )
              )}
            </div>
          ) : null}
        </section>

        {/* CONFIGURA PRODUTO */}
        {selectedProduct ? (
          <section className="rounded-[2rem] border border-[var(--green-200)] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-500)]">
                  Adicionar
                </p>

                <h3 className="mt-2 text-lg font-bold text-zinc-950">
                  {selectedProduct.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="text-sm font-semibold text-zinc-400 transition hover:text-zinc-700"
              >
                Cancelar
              </button>
            </div>

            {selectedProduct.colors.length >
            0 ? (
              <div className="mt-6">
                <p className="text-sm font-semibold text-zinc-700">
                  Cor
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedProduct.colors.map(
                    (color) => {
                      const selected =
                        color.id ===
                        selectedColorId;

                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => {
                            setSelectedColorId(
                              color.id
                            );

                            setAddError(
                              null
                            );
                          }}
                          className={[
                            "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                            selected
                              ? "border-[var(--green-500)] bg-[var(--green-50)] text-zinc-900"
                              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300",
                          ].join(
                            " "
                          )}
                        >
                          <span
                            className="h-5 w-5 rounded-full border border-black/10"
                            style={{
                              backgroundColor:
                                color.hex ||
                                "#ffffff",
                            }}
                          />

                          {color.name}

                          {selected ? (
                            <Check className="h-4 w-4 text-[var(--green-500)]" />
                          ) : null}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                Este produto não possui seleção de cor.
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm font-semibold text-zinc-700">
                Quantidade
              </p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  disabled={
                    quantity <= 1
                  }
                  onClick={() =>
                    setQuantity(
                      (
                        current
                      ) =>
                        Math.max(
                          1,
                          current -
                            1
                        )
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex h-11 min-w-16 items-center justify-center rounded-2xl bg-zinc-50 px-4 text-sm font-bold text-zinc-900">
                  {quantity}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (
                        current
                      ) =>
                        Math.min(
                          99,
                          current +
                            1
                        )
                    )
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {addError ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {addError}
              </div>
            ) : null}

            <button
              type="button"
              onClick={
                addItem
              }
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--green-300)] sm:w-auto"
            >
              <Plus className="h-4 w-4" />

              Adicionar ao pedido
            </button>
          </section>
        ) : null}

        {/* CLIENTE */}
        <section
          id="customer-data"
          className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--rose-500)]">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-950">
                Cliente
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Dados da pessoa responsável pelo pedido.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label="Nome completo"
                value={form.name}
                onChange={(
                  value
                ) =>
                  setField(
                    "name",
                    value
                  )
                }
                onBlur={() =>
                  validateField(
                    "name"
                  )
                }
                required
                autoComplete="name"
                error={
                  errors.name
                }
              />
            </div>

            <Field
              label="E-mail"
              type="email"
              value={
                form.email
              }
              onChange={(
                value
              ) =>
                setField(
                  "email",
                  value
                )
              }
              onBlur={() =>
                validateField(
                  "email"
                )
              }
              required
              autoComplete="email"
              error={
                errors.email
              }
            />

            <Field
              label="Telefone / WhatsApp"
              value={
                form.phone
              }
              onChange={(
                value
              ) =>
                setField(
                  "phone",
                  value
                )
              }
              onBlur={() =>
                validateField(
                  "phone"
                )
              }
              required
              autoComplete="tel"
              maxLength={16}
              error={
                errors.phone
              }
            />

            <div className="sm:col-span-2">
              <Field
                label="CPF (opcional)"
                value={
                  form.document
                }
                onChange={(
                  value
                ) =>
                  setField(
                    "document",
                    value
                  )
                }
                onBlur={() =>
                  validateField(
                    "document"
                  )
                }
                autoComplete="off"
                maxLength={14}
                error={
                  errors.document
                }
              />
            </div>
          </div>
        </section>

        {/* ENTREGA */}
        <section
          id="shipping-data"
          className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--green-50)] text-[var(--green-500)]">
              <MapPin className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-950">
                Entrega
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Informe o endereço mesmo que o frete ainda seja combinado
                posteriormente.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-4 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    sameRecipientName
                  }
                  onChange={(
                    event
                  ) =>
                    handleSameRecipientNameChange(
                      event
                        .target
                        .checked
                    )
                  }
                  className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-[var(--green-500)]"
                />

                <span className="text-sm font-semibold text-zinc-700">
                  Mesmo nome do cliente
                </span>
              </label>

              <Field
                label="Nome do destinatário"
                value={
                  form.recipientName
                }
                onChange={(
                  value
                ) =>
                  setField(
                    "recipientName",
                    value
                  )
                }
                onBlur={() =>
                  validateField(
                    "recipientName"
                  )
                }
                required
                autoComplete="shipping name"
                error={
                  errors.recipientName
                }
                disabled={
                  sameRecipientName
                }
              />
            </div>

            <Field
              label="CEP"
              value={
                form.zipCode
              }
              onChange={(
                value
              ) =>
                setField(
                  "zipCode",
                  value
                )
              }
              onBlur={
                handleZipCodeBlur
              }
              required
              autoComplete="postal-code"
              maxLength={9}
              error={
                errors.zipCode
              }
            />

            <Field
              label="Estado (UF)"
              value={
                form.state
              }
              onChange={(
                value
              ) =>
                setField(
                  "state",
                  value
                )
              }
              onBlur={() =>
                validateField(
                  "state"
                )
              }
              required
              autoComplete="address-level1"
              maxLength={2}
              error={
                errors.state
              }
            />

            {loadingZipCode ? (
              <div className="sm:col-span-2 flex items-center gap-2 rounded-2xl bg-[var(--green-50)] px-4 py-3 text-sm font-semibold text-[var(--green-500)]">
                <Loader2 className="h-4 w-4 animate-spin" />

                Buscando endereço pelo CEP...
              </div>
            ) : null}

            <div className="sm:col-span-2">
              <Field
                label="Rua"
                value={
                  form.street
                }
                onChange={(
                  value
                ) =>
                  setField(
                    "street",
                    value
                  )
                }
                onBlur={() =>
                  validateField(
                    "street"
                  )
                }
                required
                autoComplete="address-line1"
                error={
                  errors.street
                }
              />
            </div>

            <Field
              label="Número"
              value={
                form.number
              }
              onChange={(
                value
              ) =>
                setField(
                  "number",
                  value
                )
              }
              onBlur={() =>
                validateField(
                  "number"
                )
              }
              required
              inputRef={
                numberInputRef
              }
              error={
                errors.number
              }
            />

            <Field
              label="Complemento (opcional)"
              value={
                form.complement
              }
              onChange={(
                value
              ) =>
                setField(
                  "complement",
                  value
                )
              }
              error={
                errors.complement
              }
            />

            <Field
              label="Bairro"
              value={
                form.neighborhood
              }
              onChange={(
                value
              ) =>
                setField(
                  "neighborhood",
                  value
                )
              }
              onBlur={() =>
                validateField(
                  "neighborhood"
                )
              }
              required
              error={
                errors.neighborhood
              }
            />

            <Field
              label="Cidade"
              value={
                form.city
              }
              onChange={(
                value
              ) =>
                setField(
                  "city",
                  value
                )
              }
              onBlur={() =>
                validateField(
                  "city"
                )
              }
              required
              error={
                errors.city
              }
            />
          </div>
        </section>

        {/* OBSERVAÇÕES */}
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-zinc-950">
            Observações
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Informações combinadas com o cliente, detalhes de personalização ou
            qualquer contexto importante para este pedido.
          </p>

          <textarea
            value={
              form.customerNotes
            }
            onChange={(
              event
            ) =>
              setField(
                "customerNotes",
                event.target.value
              )
            }
            onBlur={() =>
              validateField(
                "customerNotes"
              )
            }
            maxLength={1000}
            rows={5}
            placeholder="Ex: pedido recebido pelo WhatsApp, precisa para dia 20, cliente pediu embalagem especial..."
            className={[
              "mt-5 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400",
              errors.customerNotes
                ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                : "border-zinc-200 focus:border-[var(--green-500)] focus:ring-4 focus:ring-[var(--green-50)]",
            ].join(
              " "
            )}
          />

          <div className="mt-2 flex items-center justify-between gap-4">
            {errors.customerNotes ? (
              <p className="text-xs font-medium text-red-600">
                {errors.customerNotes}
              </p>
            ) : (
              <span />
            )}

            <p className="shrink-0 text-xs text-zinc-400">
              {
                form.customerNotes
                  .length
              }
              /1000
            </p>
          </div>
        </section>
      </div>

      {/* RESUMO */}
      <div>
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-zinc-950">
                Resumo do pedido
              </h2>

              <p className="text-xs text-zinc-400">
                {totalItems}{" "}
                {totalItems ===
                1
                  ? "item"
                  : "itens"}
              </p>
            </div>
          </div>

          {items.length ===
          0 ? (
            <div className="mt-5 rounded-2xl bg-zinc-50 px-4 py-8 text-center">
              <Package className="mx-auto h-7 w-7 text-zinc-300" />

              <p className="mt-3 text-sm font-semibold text-zinc-600">
                Nenhum produto adicionado
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-400">
                Escolha um produto para começar o pedido.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {items.map(
                (item) => (
                  <div
                    key={
                      item.key
                    }
                    className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex gap-3">
                      <SelectedItemImage
                        item={
                          item
                        }
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900">
                              {
                                item.productName
                              }
                            </p>

                            {item.selectedColorName ? (
                              <div className="mt-1 flex items-center gap-1.5">
                                <span
                                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                                  style={{
                                    backgroundColor:
                                      item.selectedColorHex ||
                                      "#ffffff",
                                  }}
                                />

                                <span className="text-xs text-zinc-500">
                                  {
                                    item.selectedColorName
                                  }
                                </span>
                              </div>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            aria-label={`Remover ${item.productName}`}
                            onClick={() =>
                              removeItem(
                                item.key
                              )
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={
                                item.quantity <=
                                1
                              }
                              onClick={() =>
                                updateItemQuantity(
                                  item.key,
                                  item.quantity -
                                    1
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>

                            <span className="min-w-8 text-center text-sm font-bold text-zinc-900">
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              disabled={
                                item.quantity >=
                                99
                              }
                              onClick={() =>
                                updateItemQuantity(
                                  item.key,
                                  Math.min(
                                    99,
                                    item.quantity +
                                      1
                                  )
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs text-zinc-400">
                              {formatOrderCurrency(
                                item.unitPriceInCents
                              )}{" "}
                              cada
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-zinc-900">
                              {formatOrderCurrency(
                                item.unitPriceInCents *
                                  item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className="mt-6 border-t border-zinc-200 pt-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-zinc-600">
                Subtotal
              </span>

              <span className="text-lg font-bold text-zinc-950">
                {formatOrderCurrency(
                  subtotalInCents
                )}
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-400">
              O frete será definido posteriormente no fluxo normal do pedido.
            </p>
          </div>

          <div className="mt-5 border-t border-zinc-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Cliente
            </p>

            {form.name.trim() ? (
              <div className="mt-2">
                <p className="text-sm font-bold text-zinc-900">
                  {
                    form.name
                  }
                </p>

                {form.email.trim() ? (
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {
                      form.email
                    }
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">
                Ainda não informado.
              </p>
            )}
          </div>

          {orderIsReady ? (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-bold text-green-800">
                Dados completos
              </p>

              <p className="mt-1 text-xs leading-5 text-green-700">
                O pedido já tem os dados necessários para ser criado.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-zinc-50 px-4 py-3">
              <p className="text-xs leading-5 text-zinc-500">
                Adicione pelo menos um produto e preencha os dados obrigatórios
                do cliente e da entrega.
              </p>
            </div>
          )}

          <div className="mt-5 border-t border-zinc-100 pt-5">
            <label className="flex cursor-pointer items-start gap-3">
                <input
                type="checkbox"
                checked={
                    sendCreationEmails
                }
                onChange={(
                    event
                ) =>
                    setSendCreationEmails(
                    event.target.checked
                    )
                }
                disabled={
                    isSubmitting
                }
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-zinc-300 accent-[var(--green-500)]"
                />

                <span>
                <span className="block text-sm font-semibold text-zinc-700">
                    Enviar confirmação por e-mail
                </span>

                <span className="mt-1 block text-xs leading-5 text-zinc-400">
                    O cliente receberá os detalhes e o link público para acompanhar o pedido.
                </span>
                </span>
            </label>
        </div>

          {submitError ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-bold text-red-800">
                Não foi possível criar o pedido
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                {submitError}
                </p>
            </div>
            ) : null}

          <button
            type="button"
            onClick={
                handleCreateOrder
            }
            disabled={
                !orderIsReady ||
                isSubmitting
            }
            className={[
                "mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold transition",
                !orderIsReady ||
                isSubmitting
                ? "cursor-not-allowed bg-zinc-200 text-zinc-400"
                : "bg-[var(--green-500)] text-white shadow-sm hover:bg-[var(--green-300)]",
            ].join(" ")}
            >
            {isSubmitting ? (
                <>
                <Loader2 className="h-4 w-4 animate-spin" />

                Criando pedido...
                </>
            ) : (
                <>
                <Check className="h-4 w-4" />

                Criar pedido
                </>
            )}
            </button>
            <p className="mt-2 text-center text-xs leading-5 text-zinc-400">
                O pedido entrará no fluxo normal de atendimento após a criação.
            </p>
        </section>
      </div>
    </div>
  );
}