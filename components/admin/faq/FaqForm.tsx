"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type {
  AdminFaqItem,
  AdminFaqResponse,
  FaqFormValues,
} from "@/components/admin/faq/types";

type FaqFormProps = {
  mode: "create" | "edit";
  initialFaqItem?: AdminFaqItem;
};

export default function FaqForm({ mode, initialFaqItem }: FaqFormProps) {
  const router = useRouter();

  const [values, setValues] = useState<FaqFormValues>({
    question: initialFaqItem?.question ?? "",
    answer: initialFaqItem?.answer ?? "",
    active: initialFaqItem?.active ?? true,
    position: initialFaqItem?.position ?? 1,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoadingPosition, setIsLoadingPosition] = useState(mode === "create");
  const [isSaving, setIsSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const showOverlay = isLoadingPosition || isSaving || isPending;

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    async function loadNextPosition() {
      setIsLoadingPosition(true);

      try {
        const response = await fetch("/api/admin/settings/faq", {
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | AdminFaqResponse
          | null;

        if (!response.ok || !data?.items) {
          setValues((current) => ({
            ...current,
            position: 1,
          }));
          return;
        }

        const maxPosition = data.items.reduce((max, item) => {
          return Math.max(max, Number(item.position) || 0);
        }, 0);

        setValues((current) => ({
          ...current,
          position: maxPosition + 1,
        }));
      } catch {
        setValues((current) => ({
          ...current,
          position: 1,
        }));
      } finally {
        setIsLoadingPosition(false);
      }
    }

    loadNextPosition();
  }, [mode]);

  function updateValue<K extends keyof FaqFormValues>(
    key: K,
    value: FaqFormValues[K]
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const question = values.question.trim();
    const answer = values.answer.trim();

    if (question.length < 2) {
      setError("Informe uma pergunta válida.");
      return;
    }

    if (answer.length < 2) {
      setError("Informe uma resposta válida.");
      return;
    }

    const payload = {
      question,
      answer,
      active: values.active,
      position: Number(values.position) || 1,
    };

    const url =
      mode === "create"
        ? "/api/admin/settings/faq"
        : `/api/admin/settings/faq/${initialFaqItem?.id}`;

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
        setError(data?.message ?? "Não foi possível salvar a pergunta.");
        setIsSaving(false);
        return;
      }

      startTransition(() => {
        router.push("/admin/settings/faq");
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
          isLoadingPosition
            ? "Preparando pergunta..."
            : mode === "create"
              ? "Criando pergunta..."
              : "Salvando pergunta..."
        }
        description={
          isLoadingPosition
            ? "Calculando a próxima posição da pergunta."
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
              htmlFor="faq-question"
              className="text-sm font-semibold text-zinc-800"
            >
              Pergunta
            </label>

            <input
              id="faq-question"
              type="text"
              required
              minLength={2}
              disabled={showOverlay}
              value={values.question}
              onChange={(event) => updateValue("question", event.target.value)}
              placeholder="Ex: Vocês fazem peças personalizadas?"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="faq-answer"
              className="text-sm font-semibold text-zinc-800"
            >
              Resposta
            </label>

            <textarea
              id="faq-answer"
              required
              minLength={2}
              rows={7}
              disabled={showOverlay}
              value={values.answer}
              onChange={(event) => updateValue("answer", event.target.value)}
              placeholder="Escreva a resposta que aparecerá na página de FAQ..."
              className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-semibold text-zinc-800">
                Posição na lista
              </p>

              <p className="mt-2 rounded-xl bg-white px-3 py-2 font-mono text-sm text-zinc-600 ring-1 ring-zinc-200">
                {isLoadingPosition ? "calculando..." : values.position}
              </p>

              <p className="mt-2 text-xs leading-5 text-zinc-500">
                {mode === "create"
                  ? "Novas perguntas são adicionadas automaticamente ao final da lista."
                  : "Para mudar a posição, use as setas na listagem de FAQ."}
              </p>
            </div>

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
                    Pergunta ativa
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-zinc-500">
                    Perguntas inativas não aparecem na página pública de FAQ.
                  </span>
                </span>
              </label>
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
              onClick={() => router.push("/admin/settings/faq")}
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
                  ? "Criar pergunta"
                  : "Salvar alterações"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}