import Link from 'next/link';
import Image from 'next/image';
import Button from './Button';
import Container from './Container';

type NavItem = { label: string; href: string };

const nav: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Loja", href: "/loja" },
  { label: "Personalizados", href: "/personalizados" },
  { label: "Sobre", href: "/sobre" },
  { label: "Contato", href: "/contato" },
];

const Navbar = () => (
    <header className="sticky top-0 z-50 border-b border-[var(--rose-100)] bg-[var(--rose-50)]/80 backdrop-blur">
        <Container>
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[var(--rose-500)]  hover:text-[var(--green-500)]">
                <Image
                  src="/icon.png"
                  width={64}
                  height={64}
                  alt="Biscuit_eria logo"/>
              <div className="leading-tight">
                <div className="font-playfair text-2xl lg:text-3xl font-semibold ">
                  Biscuit_eria
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Button href="/loja" variant="secondary">
                Descobrir peças
              </Button>
              <Button href="/personalizados">Criar algo só meu</Button>
            </div>

            <div className="md:hidden">
              <Button href="/loja" variant="primary">
                Loja
              </Button>
            </div>
          </div>
        </Container>
      </header>
);

export default Navbar;