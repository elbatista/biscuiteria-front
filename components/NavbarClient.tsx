"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import Button from "./Button";
import Container from "./Container";
import CartBadge from "@/components/cart/CartBadge";

type NavItem = { label: string; href: string };

type NavbarClientProps = {
  storeName: string;
};

const nav: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Loja", href: "/loja" },
  { label: "Coleções", href: "/colecoes" },
  { label: "Personalizados", href: "/personalizados" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

function isNavItemActive(href: string, pathname: string) {
  if (href === "/loja") {
    return (
      pathname === "/loja" ||
      pathname.startsWith("/produtos") ||
      pathname.startsWith("/carrinho") ||
      pathname.startsWith("/checkout") ||
      pathname.startsWith("/pedido")
    );
  }

  if (href === "/colecoes") {
    return pathname === "/colecoes" || pathname.startsWith("/colecoes");
  }

  return pathname === href;
}

export default function NavbarClient({ storeName }: NavbarClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-[var(--rose-100)]",
        open ? "bg-[var(--rose-50)]" : "bg-[var(--rose-50)]/80 backdrop-blur",
      ].join(" ")}
    >
      <Container>
        <div className="flex h-20 items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--rose-500)] transition hover:text-[var(--green-500)]"
          >
            <Image src="/icon.png" width={64} height={64} alt={`${storeName} logo`} />
            <div className="leading-tight">
              <div className="font-playfair text-2xl font-semibold lg:text-3xl">
                {storeName}
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:gap-10 md:flex">
            {nav.map((item) => {
              const active = isNavItemActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "text-lg transition",
                    active
                      ? "text-[var(--rose-500)]"
                      : "text-[var(--text-muted)] hover:text-[var(--green-500)]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <CartBadge />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <CartBadge />

            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white/70 p-3 text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div className="md:hidden">
          <div id="mobile-menu" className="fixed inset-0 z-[100] bg-[var(--rose-50)]">
            <Container>
              <div className="flex h-screen flex-col">
                <div className="flex h-20 items-center justify-between border-b border-[var(--rose-100)]">
                  <div className="font-playfair text-2xl font-semibold text-[var(--rose-500)]">
                    Menu
                  </div>

                  <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setOpen(false)}
                    className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-[var(--rose-100)] bg-white/70 p-3 text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex flex-1 flex-col justify-center gap-4 py-8">
                  {nav.map((item) => {
                    const active = isNavItemActive(item.href, pathname);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          "text-center font-playfair text-3xl transition",
                          active
                            ? "text-[var(--green-500)]"
                            : "text-[var(--rose-500)] hover:text-[var(--green-500)]",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  <Link
                    href="/carrinho"
                    className="pt-4 text-center font-playfair text-3xl text-[var(--rose-500)] transition hover:text-[var(--green-500)]"
                  >
                    Carrinho
                  </Link>
                </nav>

                <div className="grid gap-3 pb-30">
                  <Button href="/personalizados">Criar algo só meu</Button>
                  <Button href="/contato" variant="secondary">
                    Falar comigo
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        </div>
      )}
    </header>
  );
}