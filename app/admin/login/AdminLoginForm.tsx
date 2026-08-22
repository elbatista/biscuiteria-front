"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";

import { useRouter } from "next/navigation";

type AdminLoginFormProps = {
  passwordChanged?: boolean;
};

export default function AdminLoginForm({
  passwordChanged = false,
}: AdminLoginFormProps) {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/admin/auth/login",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                email,
                password,
              }),
          }
        );

      const data =
        (await response
          .json()
          .catch(
            () => null
          )) as
          | {
              message?: string;
            }
          | null;

      if (
        !response.ok
      ) {
        setError(
          data?.message ??
            "Não foi possível fazer login."
        );

        return;
      }

      router.replace(
        "/admin"
      );

      router.refresh();
    } catch {
      setError(
        "Erro de conexão. Tente novamente."
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--rose-500)]">
          <LockKeyhole className="h-6 w-6" />
        </div>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
          Administração
        </p>

        <h1 className="mt-2 font-playfair text-3xl font-semibold text-zinc-950">
          Entrar no painel
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Informe suas credenciais para acessar o painel administrativo da Biscuiteria.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-8 space-y-5"
      >
        {passwordChanged ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-700"
          >
            Senha alterada com sucesso. Entre novamente com sua nova senha.
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
          >
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-zinc-700"
          >
            E-mail
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={
                submitting
              }
              value={
                email
              }
              onChange={(
                event
              ) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="seu@email.com"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-zinc-700"
          >
            Senha
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              required
              disabled={
                submitting
              }
              value={
                password
              }
              onChange={(
                event
              ) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="••••••••••"
              className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-12 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50"
            />

            <button
              type="button"
              disabled={
                submitting
              }
              onClick={() =>
                setShowPassword(
                  (
                    current
                  ) =>
                    !current
                )
              }
              aria-label={
                showPassword
                  ? "Ocultar senha"
                  : "Mostrar senha"
              }
              aria-pressed={
                showPassword
              }
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={
            submitting
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" />

          {submitting
            ? "Entrando..."
            : "Entrar"}
        </button>
      </form>
    </section>
  );
}