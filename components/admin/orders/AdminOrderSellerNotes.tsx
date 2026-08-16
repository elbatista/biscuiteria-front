"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
} from "lucide-react";

import type { AdminOrderDetails } from "@/lib/admin/orders/get-admin-order";

type AdminOrderSellerNotesProps = {
  order: Pick<
    AdminOrderDetails,
    | "id"
    | "sellerNotes"
  >;
};

export default function AdminOrderSellerNotes({
  order,
}: AdminOrderSellerNotesProps) {
  const router =
    useRouter();

  const [
    sellerNotes,
    setSellerNotes,
  ] = useState(
    order.sellerNotes ?? ""
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    success,
    setSuccess,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response =
        await fetch(
          `/api/admin/orders/${order.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              intent:
                "update_notes",

              sellerNotes:
                sellerNotes.trim(),
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Não foi possível salvar as notas."
        );
      }

      setSuccess(true);

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as notas."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-4"
    >
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Notas salvas.
        </div>
      ) : null}

      <textarea
        value={
          sellerNotes
        }
        onChange={(
          event
        ) => {
          setSellerNotes(
            event.target.value
          );

          setSuccess(false);
        }}
        placeholder="Ex: cliente pediu entrega até sexta, preferência de embalagem..."
        rows={5}
        maxLength={5000}
        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-relaxed text-zinc-900 outline-none transition focus:border-[var(--green-500)]"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-400">
          {sellerNotes.length}
          /5000 caracteres
        </p>

        <button
          type="submit"
          disabled={
            saving
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--green-500)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--green-300)] disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          Salvar notas
        </button>
      </div>
    </form>
  );
}