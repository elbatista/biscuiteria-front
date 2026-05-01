'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(data?.message ?? 'Não foi possível fazer login.');
        return;
      }

      startTransition(() => {
        router.replace('/admin');
        router.refresh();
      });
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="admin-email"
          className="text-sm font-semibold text-zinc-700"
        >
          E-mail
        </label>

        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100"
          placeholder="admin@biscuiteria.shop"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="admin-password"
          className="text-sm font-semibold text-zinc-700"
        >
          Senha
        </label>

        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--rose-500)] focus:ring-4 focus:ring-rose-100"
          placeholder="••••••••"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-[var(--rose-500)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Entrando...' : 'Entrar no admin'}
      </button>
    </form>
  );
}