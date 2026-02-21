// import Link from 'next/link';
// import Image from 'next/image';
// import Button from './Button';
// import Container from './Container';

// type NavItem = { label: string; href: string };

// const nav: NavItem[] = [
//   { label: "Início", href: "/" },
//   { label: "Loja", href: "/loja" },
//   { label: "Personalizados", href: "/personalizados" },
//   { label: "Sobre", href: "/sobre" },
//   { label: "Contato", href: "/contato" },
// ];

// const Navbar = () => (
//     <header className="sticky top-0 z-50 border-b border-[var(--rose-100)] bg-[var(--rose-50)]/80 backdrop-blur">
//         <Container>
//           <div className="flex h-20 items-center justify-between">
//             <Link href="/" className="flex items-center gap-2 text-[var(--rose-500)]  hover:text-[var(--green-500)]">
//                 <Image
//                   src="/icon.png"
//                   width={64}
//                   height={64}
//                   alt="Biscuit_eria logo"/>
//               <div className="leading-tight">
//                 <div className="font-playfair text-2xl lg:text-3xl font-semibold ">
//                   Biscuit_eria
//                 </div>
//               </div>
//             </Link>

//             <nav className="hidden items-center gap-6 md:flex">
//               {nav.map((item) => (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className="text-lg text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
//                   {item.label}
//                 </Link>
//               ))}
//             </nav>

//             <div className="hidden items-center gap-3 lg:flex">
//               <Button href="/loja" variant="secondary">
//                 Descobrir peças
//               </Button>
//               <Button href="/personalizados">Criar algo só meu</Button>
//             </div>

//             <div className="md:hidden">
//               <Button href="/loja" variant="primary">
//                 Loja
//               </Button>
//             </div>
//           </div>
//         </Container>
//       </header>
// );

// export default Navbar;
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import Button from "./Button";
import Container from "./Container";

type NavItem = { label: string; href: string };

const nav: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Loja", href: "/loja" },
  { label: "Personalizados", href: "/personalizados" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // fecha menu quando muda de rota
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // trava scroll quando menu mobile aberto
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
        // Desktop: mantém blur / Mobile: opaco quando menu aberto
        open ? "bg-[var(--rose-50)]" : "bg-[var(--rose-50)]/80 backdrop-blur",
      ].join(" ")}
    >
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--rose-500)] hover:text-[var(--green-500)] transition"
          >
            <Image src="/icon.png" width={64} height={64} alt="Biscuit_eria logo" />
            <div className="leading-tight">
              <div className="font-playfair text-2xl lg:text-3xl font-semibold">
                Biscuit_eria
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "text-lg transition",
                    active
                      ? "text-[var(--green-500)]"
                      : "text-[var(--text-muted)] hover:text-[var(--green-500)]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 lg:flex">
            <Button href="/loja" variant="secondary">
              Descobrir peças
            </Button>
            <Button href="/personalizados">Criar algo só meu</Button>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Button href="/loja" variant="secondary">
              Loja
            </Button>

            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center cursor-pointer justify-center rounded-2xl border border-[var(--rose-100)] bg-white/70 p-3 text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu (FULLSCREEN + OPACO) */}
      {open && (
        <div className="md:hidden">
          <div
            id="mobile-menu"
            className="fixed inset-0 z-[100] bg-[var(--rose-50)]"
          >
            <Container>
              <div className="flex h-screen flex-col">
                {/* Menu header */}
                <div className="flex h-20 items-center justify-between border-b border-[var(--rose-100)]">
                  <div className="font-playfair text-2xl font-semibold text-[var(--rose-500)]">
                    Menu
                  </div>

                  <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center cursor-pointer justify-center rounded-2xl border border-[var(--rose-100)] bg-white/70 p-3 text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Links centralizados */}
                <nav className="flex flex-1 flex-col justify-center gap-4 py-8">
                  {nav.map((item) => {
                    const active = pathname === item.href;
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
                </nav>

                {/* CTAs no rodapé */}
                <div className="grid gap-3 pb-10">
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