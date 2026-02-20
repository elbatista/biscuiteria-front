"use client";

import { useMemo, useState } from "react";

export default function ContactForm({
  whatsappBaseUrl,
}: {
  whatsappBaseUrl: string; // ex: https://wa.me/5551999999999
}) {
  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");

  const whatsappLink = useMemo(() => {
    const text = encodeURIComponent(
      `Oi! Meu nome é ${nome || "—"}.\n\n${mensagem || "Quero falar sobre um pedido 😊"}`
    );
    return `${whatsappBaseUrl}?text=${text}`;
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
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-zinc-900" htmlFor="mensagem">
            Mensagem
          </label>
          <textarea
            id="mensagem"
            rows={5}
            className="w-full rounded-2xl border border-[var(--rose-100)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--green-300)]"
            placeholder="Me conta sua ideia, data, tema ou dúvida…"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition bg-[var(--green-500)] text-white hover:bg-[var(--green-300)] shadow-sm"
        >
          Enviar pelo WhatsApp
        </a>

        <p className="text-xs text-[var(--text-muted)]">
          Ao clicar, você será redirecionado para o WhatsApp para continuar a conversa.
        </p>
      </div>
    </div>
  );
}