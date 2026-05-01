"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

import {
  adminExternalNavItems,
  adminNavItems,
  isActiveAdminPath,
} from "@/components/admin/admin-nav-items";

export default function AdminMobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        aria-expanded={open}
        aria-controls="admin-mobile-menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        Menu
        <ChevronDown
          className={[
            "h-4 w-4 transition",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open ? (
        <div
          id="admin-mobile-menu"
          className="absolute left-0 right-0 top-full z-50 border-b border-zinc-200 bg-white px-4 py-4 shadow-lg sm:px-6 lg:hidden"
        >
          <div className="grid gap-2">
            <div className="grid gap-2 sm:grid-cols-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActiveAdminPath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-rose-50 text-[var(--rose-500)]"
                        : "bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 border-t border-zinc-200 pt-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {adminExternalNavItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-200 transition hover:bg-zinc-50 hover:text-zinc-950"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}