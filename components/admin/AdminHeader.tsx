import Link from "next/link";
import { LogOut, Store } from "lucide-react";

import AdminMobileMenu from "@/components/admin/AdminMobileMenu";

type AdminHeaderProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
};

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="relative">
        <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <AdminMobileMenu />

            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-900">
                Painel administrativo
              </div>

              <div className="truncate text-xs text-zinc-500">
                Logado como {user.name ?? user.email}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 sm:inline-flex"
            >
              <Store className="h-4 w-4" />
              Ver loja
            </Link>

            <form action="/api/admin/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-[var(--rose-500)] transition hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}