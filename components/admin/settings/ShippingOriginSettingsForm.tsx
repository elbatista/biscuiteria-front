"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type { AdminStoreSettings } from "@/components/admin/settings/types";

type ShippingOriginValues = {
  originZipCode: string;
  originStreet: string;
  originNumber: string;
  originDistrict: string;
  originCity: string;
  originState: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function ShippingOriginSettingsForm() {
  const router = useRouter();

  const [values, setValues] = useState<ShippingOriginValues>({
    originZipCode: "",
    originStreet: "",
    originNumber: "",
    originDistrict: "",
    originCity: "",
    originState: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const showOverlay = isLoading || isSaving || isPending;

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/settings", {
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | AdminStoreSettings
          | { message?: string }
          | null;

        if (!response.ok) {
          setError(
            data && "message" in data && data.message
              ? data.message
              : "Não foi possível carregar o endereço."
          );
          return;
        }

        const settings = data as AdminStoreSettings;

        setValues({
          originZipCode: formatCep(settings.originZipCode ?? ""),
          originStreet: settings.originStreet ?? "",
          originNumber: settings.originNumber ?? "",
          originDistrict: settings.originDistrict ?? "",
          originCity: settings.originCity ?? "",
          originState: settings.originState ?? "",
        });
      } catch {
        setError("Erro de conexão ao carregar endereço.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateValue<K extends keyof ShippingOriginValues>(
    key: K,
    value: ShippingOriginValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cepDigits = onlyDigits(values.originZipCode);

    if (cepDigits && cepDigits.length !== 8) {
      setError("Informe um CEP válido com 8 dígitos.");
      return;
    }

    const uf = values.originState.trim().toUpperCase();

    if (uf && uf.length !== 2) {
      setError("Informe a UF com 2 letras.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings/shipping-origin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          originZipCode: cepDigits,
          originStreet: values.originStreet.trim(),
          originNumber: values.originNumber.trim(),
          originDistrict: values.originDistrict.trim(),
          originCity: values.originCity.trim(),
          originState: uf,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(data?.message ?? "Não foi possível salvar o endereço.");
        setIsSaving(false);
        return;
      }

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
        title={isLoading ? "Carregando endereço..." : "Salvando endereço..."}
        description={
          isLoading
            ? "Buscando o endereço de origem atual."
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
            Frete
          </p>

          <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Origem do frete
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Configure o endereço usado como origem para cálculo de frete.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-[180px_1fr_160px]">
              <div className="space-y-2">
                <label
                  htmlFor="origin-zip-code"
                  className="text-sm font-semibold text-zinc-800"
                >
                  CEP
                </label>

                <input
                  id="origin-zip-code"
                  type="text"
                  inputMode="numeric"
                  disabled={showOverlay}
                  value={values.originZipCode}
                  onChange={(event) =>
                    updateValue("originZipCode", formatCep(event.target.value))
                  }
                  placeholder="00000-000"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="origin-street"
                  className="text-sm font-semibold text-zinc-800"
                >
                  Rua
                </label>

                <input
                  id="origin-street"
                  type="text"
                  disabled={showOverlay}
                  value={values.originStreet}
                  onChange={(event) =>
                    updateValue("originStreet", event.target.value)
                  }
                  placeholder="Rua de origem"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="origin-number"
                  className="text-sm font-semibold text-zinc-800"
                >
                  Número
                </label>

                <input
                  id="origin-number"
                  type="text"
                  disabled={showOverlay}
                  value={values.originNumber}
                  onChange={(event) =>
                    updateValue("originNumber", event.target.value)
                  }
                  placeholder="123"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_120px]">
              <div className="space-y-2">
                <label
                  htmlFor="origin-district"
                  className="text-sm font-semibold text-zinc-800"
                >
                  Bairro
                </label>

                <input
                  id="origin-district"
                  type="text"
                  disabled={showOverlay}
                  value={values.originDistrict}
                  onChange={(event) =>
                    updateValue("originDistrict", event.target.value)
                  }
                  placeholder="Bairro"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="origin-city"
                  className="text-sm font-semibold text-zinc-800"
                >
                  Cidade
                </label>

                <input
                  id="origin-city"
                  type="text"
                  disabled={showOverlay}
                  value={values.originCity}
                  onChange={(event) =>
                    updateValue("originCity", event.target.value)
                  }
                  placeholder="Cidade"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="origin-state"
                  className="text-sm font-semibold text-zinc-800"
                >
                  UF
                </label>

                <input
                  id="origin-state"
                  type="text"
                  maxLength={2}
                  disabled={showOverlay}
                  value={values.originState}
                  onChange={(event) =>
                    updateValue(
                      "originState",
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="RS"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm uppercase outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
                />
              </div>
            </div>

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
                {isSaving ? "Salvando..." : "Salvar origem do frete"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}