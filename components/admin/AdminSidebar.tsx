"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  adminExternalNavItems,
  adminNavItems,
  isActiveAdminPath,
} from "@/components/admin/admin-nav-items";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
      <div className="border-b border-zinc-200 px-6 py-5">
        <Link href="/admin" className="block">
          <div className="font-playfair text-2xl font-semibold text-[var(--rose-500)]">
            Biscuit_eria
          </div>

          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
            Admin
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-5">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveAdminPath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                active
                  ? "bg-rose-50 text-[var(--rose-500)]"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-4">
        {adminExternalNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}