"use client";

import { useMemo, useState } from "react";

export default function ContactForm({
  whatsappBaseUrl,
}: {
  whatsappBaseUrl: string;
}) {
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");

  const whatsappLink = useMemo(() => {
    if (!whatsappBaseUrl) {
      return "";
    }

    const separator = whatsappBaseUrl.includes("?") ? "&" : "?";

    const text = encodeURIComponent(
      `Oi! Meu nome é ${
        nome || "—"
      }.\n\n${mensagem || "Quero falar sobre um pedido 😊"}`
    );

    return `${whatsappBaseUrl}${separator}text=${text}`;
  }, [nome, mensagem, whatsappBaseUrl]);

  return (
    <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-6 shadow-sm">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-zinc-900" htmlFor="nome">
            Nome
          </label>

          <input
            id="nome"
            className="w-full rounded-2xl border border-[var(--rose-100)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--green-300)]"
            placeholder="Seu nome"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-semibold text-zinc-900"
            htmlFor="mensagem"
          >
            Mensagem
          </label>

          <textarea
            id="mensagem"
            rows={5}
            className="w-full rounded-2xl border border-[var(--rose-100)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--green-300)]"
            placeholder="Me conta sua ideia, data, tema ou dúvida…"
            value={mensagem}
            onChange={(event) => setMensagem(event.target.value)}
          />
        </div>

        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)]"
          >
            Enviar pelo WhatsApp
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center rounded-2xl bg-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-500"
          >
            WhatsApp indisponível
          </button>
        )}

        <p className="text-xs text-[var(--text-muted)]">
          {whatsappLink
            ? "Ao clicar, você será redirecionado para o WhatsApp para continuar a conversa."
            : "Configure o WhatsApp no admin para habilitar o envio direto."}
        </p>
      </div>
    </div>
  );
}