"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useCartStore } from "@/stores/cart-store";
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

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

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
  onChange: (value: string) => void;
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
      <span className="text-sm font-medium text-zinc-900">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={error ? "true" : "false"}
        className={[
          "h-12 rounded-2xl border bg-white px-4 text-sm text-zinc-900 outline-none transition",
          error
            ? "border-red-300 focus:border-red-500"
            : "border-[var(--rose-100)] focus:border-[var(--green-500)]",
          disabled ? "cursor-not-allowed bg-zinc-50 text-zinc-500" : "",
        ].join(" ")}
      />

      {error ? (
        <span className="text-sm font-medium text-red-600">{error}</span>
      ) : null}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-900">{label}</span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={5}
        aria-invalid={error ? "true" : "false"}
        className={[
          "rounded-2xl border bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 outline-none transition",
          error
            ? "border-red-300 focus:border-red-500"
            : "border-[var(--rose-100)] focus:border-[var(--green-500)]",
          disabled ? "cursor-not-allowed bg-zinc-50 text-zinc-500" : "",
        ].join(" ")}
      />

      <div className="flex items-center justify-between gap-3">
        {error ? (
          <span className="text-sm font-medium text-red-600">{error}</span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">
            Opcional. Use para informar detalhes de personalização, datas ou
            observações.
          </span>
        )}

        {maxLength ? (
          <span className="shrink-0 text-xs text-[var(--text-muted)]">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
    </label>
  );
}

type CheckoutFormProps = {
  onErrorChange: (message: string | null) => void;
  onStateChange: (state: {
    submitting: boolean;
    loadingZipCode: boolean;
    redirecting: boolean;
  }) => void;
};

export default function CheckoutForm({
  onErrorChange,
  onStateChange,
}: CheckoutFormProps) {
  const router = useRouter();
  const numberInputRef = useRef<HTMLInputElement>(null);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [form, setForm] = useState<CheckoutFormState>(initialCheckoutForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingZipCode, setLoadingZipCode] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const [sameRecipientName, setSameRecipientName] = useState(true);

  const isBusy = submitting || loadingZipCode || redirecting;

  function updateExternalState(next: {
    submitting?: boolean;
    loadingZipCode?: boolean;
    redirecting?: boolean;
  }) {
    onStateChange({
      submitting,
      loadingZipCode,
      redirecting,
      ...next,
    });
  }

  function setField<K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K]
  ) {
    if (isBusy) return;

    let nextValue = value;

    if (key === "zipCode") {
      nextValue = formatZipCode(String(value)) as CheckoutFormState[K];
    }

    if (key === "phone") {
      nextValue = formatPhoneBR(String(value)) as CheckoutFormState[K];
    }

    if (key === "document") {
      nextValue = formatCpf(String(value)) as CheckoutFormState[K];
    }

    if (key === "state") {
      nextValue = String(value)
        .toUpperCase()
        .slice(0, 2) as CheckoutFormState[K];
    }

    setForm((current) => {
      const nextForm = {
        ...current,
        [key]: nextValue,
      };

      if (key === "name" && sameRecipientName) {
        nextForm.recipientName = String(nextValue);
      }

      return nextForm;
    });

    setErrors((current) => {
      const nextErrors = {
        ...current,
        [key]: undefined,
      };

      if (key === "name" && sameRecipientName) {
        nextErrors.recipientName = undefined;
      }

      return nextErrors;
    });

    onErrorChange(null);
  }

  function handleSameRecipientNameChange(checked: boolean) {
    if (isBusy) return;

    setSameRecipientName(checked);

    if (checked) {
      setForm((current) => ({
        ...current,
        recipientName: current.name,
      }));

      setErrors((current) => ({
        ...current,
        recipientName: undefined,
      }));

      onErrorChange(null);
    }
  }

  function validateField(key: keyof CheckoutFormState) {
    const message = getFieldError(key, form[key]);
    setErrors((current) => ({ ...current, [key]: message }));
    return !message;
  }

  function validateForm() {
    const nextErrors: FieldErrors = {
      name: getFieldError("name", form.name),
      email: getFieldError("email", form.email),
      phone: getFieldError("phone", form.phone),
      document: getFieldError("document", form.document),
      recipientName: getFieldError("recipientName", form.recipientName),
      zipCode: getFieldError("zipCode", form.zipCode),
      street: getFieldError("street", form.street),
      number: getFieldError("number", form.number),
      complement: getFieldError("complement", form.complement),
      neighborhood: getFieldError("neighborhood", form.neighborhood),
      city: getFieldError("city", form.city),
      state: getFieldError("state", form.state),
      customerNotes: getFieldError("customerNotes", form.customerNotes),
    };

    setErrors(nextErrors);

    const firstError = Object.values(nextErrors).find(Boolean);

    return {
      valid: !firstError,
      firstError,
    };
  }

  async function handleZipCodeBlur() {
    if (isBusy) return;

    const zipCodeDigits = onlyDigits(form.zipCode);

    validateField("zipCode");

    if (zipCodeDigits.length === 0) return;
    if (zipCodeDigits.length !== 8) return;

    setLoadingZipCode(true);
    updateExternalState({ loadingZipCode: true });
    onErrorChange(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${zipCodeDigits}/json/`
      );

      const data = (await response.json()) as ViaCepResponse;

      if (!response.ok || data.erro) {
        setErrors((current) => ({
          ...current,
          zipCode: "Não foi possível localizar esse CEP.",
        }));
        return;
      }

      setForm((current) => ({
        ...current,
        zipCode: formatZipCode(data.cep || zipCodeDigits),
        street: data.logradouro || current.street,
        complement: current.complement || data.complemento || "",
        neighborhood: data.bairro || current.neighborhood,
        city: data.localidade || current.city,
        state: (data.uf || current.state).toUpperCase(),
      }));

      setErrors((current) => ({
        ...current,
        zipCode: undefined,
        street: undefined,
        neighborhood: undefined,
        city: undefined,
        state: undefined,
      }));

      window.setTimeout(() => {
        numberInputRef.current?.focus();
      }, 50);
    } catch {
      setErrors((current) => ({
        ...current,
        zipCode: "Não foi possível buscar o CEP agora. Tente novamente.",
      }));
    } finally {
      setLoadingZipCode(false);
      updateExternalState({ loadingZipCode: false });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) return;

    if (items.length === 0) {
      onErrorChange("Seu carrinho está vazio.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const validation = validateForm();

    if (!validation.valid) {
      onErrorChange(validation.firstError || "Revise os campos do formulário.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    updateExternalState({ submitting: true });
    onErrorChange(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: onlyDigits(form.phone),
            document: form.document.trim()
              ? onlyDigits(form.document)
              : undefined,
          },
          shippingAddress: {
            recipientName: form.recipientName.trim(),
            zipCode: onlyDigits(form.zipCode),
            street: form.street.trim(),
            number: form.number.trim(),
            complement: form.complement.trim() || undefined,
            neighborhood: form.neighborhood.trim(),
            city: form.city.trim(),
            state: form.state.trim().toUpperCase(),
            country: "BR",
          },
          customerNotes: form.customerNotes.trim() || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            selectedColorId: item.selectedColorId,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Não foi possível enviar seu pedido.");
      }

      setSubmitting(false);
      setRedirecting(true);
      updateExternalState({ submitting: false, redirecting: true });

      clearCart();
      router.push(`/pedido/${result.publicId}`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao enviar seu pedido.";

      setSubmitting(false);
      setRedirecting(false);
      updateExternalState({ submitting: false, redirecting: false });

      onErrorChange(message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <>
      {isBusy ? (
        <div className="fixed inset-0 z-[80] bg-[var(--rose-50)]/80 backdrop-blur-sm">
          <div className="flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-md rounded-3xl border border-[var(--rose-100)] bg-white p-8 text-center shadow-xl">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--green-500)]" />

              <h2 className="mt-4 text-xl font-semibold text-zinc-900">
                {redirecting
                  ? "Abrindo seu pedido..."
                  : loadingZipCode
                    ? "Buscando endereço..."
                    : "Enviando pedido..."}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {redirecting
                  ? "Seu pedido foi recebido. Estamos abrindo a página com os detalhes."
                  : loadingZipCode
                    ? "Aguarde enquanto buscamos os dados do CEP."
                    : "Aguarde um instante enquanto registramos seu pedido."}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form
        id="checkout-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-busy={isBusy}
      >
        <fieldset disabled={isBusy} className="space-y-6">
          <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Dados do cliente
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Nome completo"
                  value={form.name}
                  onChange={(value) => setField("name", value)}
                  onBlur={() => validateField("name")}
                  required
                  autoComplete="name"
                  error={errors.name}
                  disabled={isBusy}
                />
              </div>

              <Field
                label="E-mail"
                type="email"
                value={form.email}
                onChange={(value) => setField("email", value)}
                onBlur={() => validateField("email")}
                required
                autoComplete="email"
                error={errors.email}
                disabled={isBusy}
              />

              <Field
                label="Telefone / WhatsApp"
                value={form.phone}
                onChange={(value) => setField("phone", value)}
                onBlur={() => validateField("phone")}
                required
                autoComplete="tel"
                maxLength={16}
                error={errors.phone}
                disabled={isBusy}
              />

              <div className="sm:col-span-2">
                <Field
                  label="CPF (opcional)"
                  value={form.document}
                  onChange={(value) => setField("document", value)}
                  onBlur={() => validateField("document")}
                  autoComplete="off"
                  maxLength={14}
                  error={errors.document}
                  disabled={isBusy}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Endereço de entrega
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              O frete será combinado depois, mas o endereço ajuda a vendedora a
              calcular a melhor opção.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-3 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sameRecipientName}
                    onChange={(event) =>
                      handleSameRecipientNameChange(event.target.checked)
                    }
                    disabled={isBusy}
                    className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-[var(--green-500)]"
                  />

                  <span className="text-sm font-medium text-zinc-800">
                    Mesmo nome do cliente
                  </span>
                </label>

                <Field
                  label="Nome do destinatário"
                  value={form.recipientName}
                  onChange={(value) => setField("recipientName", value)}
                  onBlur={() => validateField("recipientName")}
                  required
                  autoComplete="shipping name"
                  error={errors.recipientName}
                  disabled={isBusy || sameRecipientName}
                />

                {sameRecipientName ? (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    O nome do destinatário será preenchido automaticamente com
                    o nome informado nos dados do cliente.
                  </p>
                ) : null}
              </div>

              <Field
                label="CEP"
                value={form.zipCode}
                onChange={(value) => setField("zipCode", value)}
                onBlur={handleZipCodeBlur}
                required
                autoComplete="postal-code"
                maxLength={9}
                disabled={isBusy}
                error={errors.zipCode}
              />

              <Field
                label="Estado (UF)"
                value={form.state}
                onChange={(value) => setField("state", value)}
                onBlur={() => validateField("state")}
                required
                autoComplete="address-level1"
                maxLength={2}
                error={errors.state}
                disabled={isBusy}
              />

              <div className="sm:col-span-2">
                <Field
                  label="Rua"
                  value={form.street}
                  onChange={(value) => setField("street", value)}
                  onBlur={() => validateField("street")}
                  required
                  autoComplete="address-line1"
                  disabled={isBusy}
                  error={errors.street}
                />
              </div>

              <Field
                label="Número"
                value={form.number}
                onChange={(value) => setField("number", value)}
                onBlur={() => validateField("number")}
                required
                autoComplete="address-line2"
                inputRef={numberInputRef}
                error={errors.number}
                disabled={isBusy}
              />

              <Field
                label="Complemento (opcional)"
                value={form.complement}
                onChange={(value) => setField("complement", value)}
                autoComplete="off"
                error={errors.complement}
                disabled={isBusy}
              />

              <Field
                label="Bairro"
                value={form.neighborhood}
                onChange={(value) => setField("neighborhood", value)}
                onBlur={() => validateField("neighborhood")}
                required
                autoComplete="address-level2"
                disabled={isBusy}
                error={errors.neighborhood}
              />

              <Field
                label="Cidade"
                value={form.city}
                onChange={(value) => setField("city", value)}
                onBlur={() => validateField("city")}
                required
                autoComplete="address-level2"
                disabled={isBusy}
                error={errors.city}
              />
            </div>

            {loadingZipCode ? (
              <div className="mt-4 text-sm font-medium text-[var(--green-500)]">
                Buscando endereço pelo CEP...
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Observações
            </h2>

            <div className="mt-5">
              <TextAreaField
                label="Mensagem para a Biscuit_eria"
                value={form.customerNotes}
                onChange={(value) => setField("customerNotes", value)}
                placeholder="Ex: preciso para uma data específica, detalhes de personalização, melhor horário para contato..."
                error={errors.customerNotes}
                disabled={isBusy}
                maxLength={1000}
              />
            </div>
          </section>

          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-800 sm:p-6">
            <h2 className="font-semibold text-amber-900">
              Frete e pagamento serão combinados depois
            </h2>

            <p className="mt-2">
              Ao enviar o pedido, você receberá um e-mail com o resumo. A
              vendedora também receberá os dados e entrará em contato o mais
              breve possível para combinar produção, envio e pagamento.
            </p>
          </section>
        </fieldset>
      </form>
    </>
  );
}