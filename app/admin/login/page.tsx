import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentAdminUser } from '@/lib/auth/admin-session';
import AdminLoginForm from './AdminLoginForm';

export const metadata: Metadata = {
  title: 'Admin | Login | Biscuiteria',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const user = await getCurrentAdminUser();

  if (user) {
    redirect('/admin');
  }

  return (
    <main className="min-h-[70vh] px-4 py-12">
      <section className="mx-auto max-w-md rounded-[2rem] border border-rose-100 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
            Biscuiteria
          </p>

          <h1 className="font-playfair text-3xl font-semibold text-zinc-900">
            Admin
          </h1>

          <p className="text-sm leading-6 text-zinc-500">
            Entre com seu usuário administrador para gerenciar a loja.
          </p>
        </div>

        <AdminLoginForm />
      </section>
    </main>
  );
}