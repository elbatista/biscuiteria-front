"use client";

import Link from "next/link";
import {
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  autoComplete:
    | "current-password"
    | "new-password";
  placeholder?: string;
  visible: boolean;
  onVisibleChange: () => void;
  onChange: (
    value: string
  ) => void;
  disabled?: boolean;
};

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  placeholder =
    "••••••••••",
  visible,
  onVisibleChange,
  onChange,
  disabled = false,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-zinc-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          autoComplete={
            autoComplete
          }
          required
          value={value}
          disabled={disabled}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500"
          placeholder={
            placeholder
          }
        />

        <button
          type="button"
          onClick={
            onVisibleChange
          }
          disabled={disabled}
          aria-label={
            visible
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
          aria-pressed={
            visible
          }
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm() {
  const router =
    useRouter();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
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

    if (isSubmitting) {
      return;
    }

    setError(null);

    /**
     * Fazemos estas verificações também
     * no frontend apenas para melhorar a UX.
     *
     * A API continua repetindo todas elas,
     * porque o backend nunca confia no navegador.
     */
    if (
      !currentPassword
    ) {
      setError(
        "Informe sua senha atual."
      );

      return;
    }

    if (
      newPassword.length <
      10
    ) {
      setError(
        "A nova senha deve ter pelo menos 10 caracteres."
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "As novas senhas não coincidem."
      );

      return;
    }

    if (
      newPassword ===
      currentPassword
    ) {
      setError(
        "A nova senha deve ser diferente da senha atual."
      );

      return;
    }

    setIsSubmitting(
      true
    );

    try {
      const response =
        await fetch(
          "/api/admin/auth/change-password",
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
                currentPassword,
                newPassword,
                confirmPassword,
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
              success?: boolean;
            }
          | null;

      /**
       * A sessão deixou de ser válida.
       *
       * Por exemplo:
       * - sessionVersion mudou;
       * - usuário foi desativado;
       * - cookie expirou.
       */
      if (
        response.status ===
        401
      ) {
        router.replace(
          "/admin/login"
        );

        router.refresh();

        return;
      }

      if (
        !response.ok
      ) {
        setError(
          data?.message ??
            "Não foi possível alterar a senha."
        );

        return;
      }

      /**
       * A própria API:
       *
       * - trocou a senha;
       * - incrementou sessionVersion;
       * - apagou o cookie.
       *
       * Portanto agora precisamos obrigatoriamente
       * fazer login novamente.
       */
      router.replace(
        "/admin/login?passwordChanged=1"
      );

      router.refresh();
    } catch {
      setError(
        "Erro de conexão. Tente novamente."
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--rose-50)] text-[var(--rose-500)]">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
              Minha conta
            </p>

            <h1 className="mt-2 font-playfair text-3xl font-semibold text-zinc-950 sm:text-4xl">
              Alterar senha
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Atualize a senha de acesso ao painel administrativo. Após a alteração, todas as sessões existentes serão encerradas e será necessário entrar novamente.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
                <LockKeyhole className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-zinc-900">
                  Segurança
                </h2>

                <p className="mt-0.5 text-sm text-zinc-500">
                  Confirme sua senha atual antes de definir uma nova.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <PasswordField
              id="current-password"
              label="Senha atual"
              autoComplete="current-password"
              value={
                currentPassword
              }
              visible={
                showCurrentPassword
              }
              disabled={
                isSubmitting
              }
              onVisibleChange={() =>
                setShowCurrentPassword(
                  (
                    current
                  ) =>
                    !current
                )
              }
              onChange={
                setCurrentPassword
              }
            />

            <div className="border-t border-zinc-100" />

            <PasswordField
              id="new-password"
              label="Nova senha"
              autoComplete="new-password"
              value={
                newPassword
              }
              visible={
                showNewPassword
              }
              disabled={
                isSubmitting
              }
              onVisibleChange={() =>
                setShowNewPassword(
                  (
                    current
                  ) =>
                    !current
                )
              }
              onChange={
                setNewPassword
              }
            />

            <PasswordField
              id="confirm-password"
              label="Confirmar nova senha"
              autoComplete="new-password"
              value={
                confirmPassword
              }
              visible={
                showConfirmPassword
              }
              disabled={
                isSubmitting
              }
              onVisibleChange={() =>
                setShowConfirmPassword(
                  (
                    current
                  ) =>
                    !current
                )
              }
              onChange={
                setConfirmPassword
              }
            />
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--green-500)]" />

              <div>
                <p className="text-sm font-semibold text-zinc-800">
                  Requisitos da nova senha
                </p>

                <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                  Use pelo menos 10 caracteres e escolha uma senha diferente da atual.
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--rose-500)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" />

              {isSubmitting
                ? "Alterando senha..."
                : "Alterar senha"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}