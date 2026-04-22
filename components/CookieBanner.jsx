"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-3xl border border-[var(--rose-100)] bg-white p-4 shadow-lg sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Este site usa cookies </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Usamos cookies para melhorar sua experiência de navegação. Ao clicar em “Aceitar”, você concorda com o uso de cookies.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={acceptCookies}
            className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 cursor-pointer">
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}