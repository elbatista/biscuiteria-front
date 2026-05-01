"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type {
  AdminStoreSettings,
  StoreStatus,
} from "@/components/admin/settings/types";

type StoreSettingsValues = {
  storeStatus: StoreStatus;
  storeClosedMessage: string;
};

export default function StoreSettingsForm() {
  const router = useRouter();

  const userHasEditedRef = useRef(false);
  const loadRequestIdRef = useRef(0);

  const [values, setValues] = useState<StoreSettingsValues>({
    storeStatus: "open",
    storeClosedMessage: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showOverlay = isLoading || isSaving || isPending;

  useEffect(() => {
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    const controller = new AbortController();

    async function loadSettings() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/admin/settings", {
          credentials: "include",
          signal: controller.signal,
        });

        const data = (await response.json().catch(() => null)) as
          | AdminStoreSettings
          | { message?: string }
          | null;

        if (controller.signal.aborted) {
          return;
        }

        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        if (!response.ok) {
          setError(
            data && "message" in data && data.message
              ? data.message
              : "Não foi possível carregar as configurações."
          );
          return;
        }

        if (userHasEditedRef.current) {
          return;
        }

        const settings = data as AdminStoreSettings;

        setValues({
          storeStatus: settings.storeStatus,
          storeClosedMessage: settings.storeClosedMessage ?? "",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setError("Erro de conexão ao carregar configurações.");
      } finally {
        if (
          !controller.signal.aborted &&
          requestId === loadRequestIdRef.current
        ) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      controller.abort();
    };
  }, []);

  function updateValue<K extends keyof StoreSettingsValues>(
    key: K,
    value: StoreSettingsValues[K]
  ) {
    userHasEditedRef.current = true;
    setSuccessMessage(null);

    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (
      values.storeStatus === "closed" &&
      values.storeClosedMessage.trim().length < 3
    ) {
      setError("Informe uma mensagem para loja fechada.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings/store", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          storeStatus: values.storeStatus,
          storeClosedMessage: values.storeClosedMessage.trim(),
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | AdminStoreSettings
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(
          data && "message" in data && data.message
            ? data.message
            : "Não foi possível salvar as configurações."
        );
        setIsSaving(false);
        return;
      }

      const savedSettings = data as AdminStoreSettings;

      setValues({
        storeStatus: savedSettings.storeStatus,
        storeClosedMessage: savedSettings.storeClosedMessage ?? "",
      });

      userHasEditedRef.current = false;
      setSuccessMessage("Configurações salvas com sucesso.");

      setIsSaving(false);

      startTransition(() => {
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
        title={isLoading ? "Carregando configurações..." : "Salvando loja..."}
        description={
          isLoading
            ? "Buscando as configurações atuais da loja."
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
            Funcionamento
          </p>

          <h1 className="mt-3 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
            Funcionamento da loja
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Abra ou feche a loja e defina a mensagem exibida quando ela estiver
            fechada.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                disabled={showOverlay}
                onClick={() => updateValue("storeStatus", "open")}
                className={[
                  "rounded-2xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                  values.storeStatus === "open"
                    ? "border-green-200 bg-green-50 ring-2 ring-green-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50",
                ].join(" ")}
              >
                <span className="block text-sm font-semibold text-zinc-950">
                  Loja aberta
                </span>

                <span className="mt-2 block text-sm leading-6 text-zinc-500">
                  Clientes podem navegar e avançar no fluxo de compra.
                </span>
              </button>

              <button
                type="button"
                disabled={showOverlay}
                onClick={() => updateValue("storeStatus", "closed")}
                className={[
                  "rounded-2xl border p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                  values.storeStatus === "closed"
                    ? "border-red-200 bg-red-50 ring-2 ring-red-100"
                    : "border-zinc-200 bg-white hover:bg-zinc-50",
                ].join(" ")}
              >
                <span className="block text-sm font-semibold text-zinc-950">
                  Loja fechada
                </span>

                <span className="mt-2 block text-sm leading-6 text-zinc-500">
                  A loja nao permite compras e mostra a mensagem configurada abaixo.
                </span>
              </button>
            </div>

            <input type="hidden" name="storeStatus" value={values.storeStatus} />

            <div className="space-y-2">
              <label
                htmlFor="store-closed-message"
                className="text-sm font-semibold text-zinc-800"
              >
                Mensagem de loja fechada
              </label>

              <textarea
                id="store-closed-message"
                rows={5}
                disabled={showOverlay}
                value={values.storeClosedMessage}
                onChange={(event) =>
                  updateValue("storeClosedMessage", event.target.value)
                }
                placeholder="Ex: Estamos preparando novidades. Volte em breve!"
                className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
              />

              <p className="text-xs leading-5 text-zinc-500">
                Obrigatória somente quando a loja estiver fechada.
              </p>
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
                {isSaving ? "Salvando..." : "Salvar configurações"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}