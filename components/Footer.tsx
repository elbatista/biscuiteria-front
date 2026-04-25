import Container from "./Container";
import Link from "next/link";
import {
  Instagram,
  MessageCircle,
  CreditCard,
  QrCode,
  FileText,
  Truck,
  Lock,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";

export default async function Footer() {
  const contact = await getPublicStoreContactSettings();

  return (
    <footer className="border-t border-[var(--rose-100)] bg-[var(--rose-50)]">
      <Container wfull>
        <div className="grid grid-cols-2 gap-5 py-12 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <div className="font-playfair font-semibold text-zinc-900">
              {contact.storeName}
            </div>

            <p className="max-w-sm text-sm text-[var(--text-muted)]">
              Enfeites personalizados em biscuit, cuias e acessórios para o seu
              chimarrão. <span className="text-xl">🧉</span>
            </p>

            <div className="flex items-center gap-4 pt-2">
              {contact.instagramUrl ? (
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              ) : null}

              {contact.whatsappUrl ? (
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
              ) : null}

              {contact.contactEmailUrl ? (
                <a
                  href={contact.contactEmailUrl}
                  aria-label="E-mail"
                  className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
                >
                  <Mail className="h-5 w-5" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-zinc-900">
              Mapa do site
            </div>

            <nav className="grid gap-2 text-sm">
              <Link
                href="/"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Início
              </Link>
              <Link
                href="/loja"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Loja
              </Link>
              <Link
                href="/colecoes"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Coleções
              </Link>
              <Link
                href="/personalizados"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Personalizados
              </Link>
              <Link
                href="/sobre"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Sobre
              </Link>
              <Link
                href="/contato"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Contato
              </Link>
              <Link
                href="/faq"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                FAQ
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-zinc-900">Políticas</div>

            <nav className="grid gap-2 text-sm">
              <Link
                href="/politica"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Política de Privacidade
              </Link>
              <Link
                href="/termos"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Termos de uso
              </Link>
              <Link
                href="/trocas"
                className="text-[var(--text-muted)] transition hover:text-[var(--green-500)]"
              >
                Trocas & Envio
              </Link>
            </nav>
          </div>

          <div className="space-y-5 text-sm text-[var(--text-muted)] lg:col-span-2">
            <div>
              <div className="mb-2 font-semibold text-zinc-900">Pagamento</div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex flex-row items-center">
                  <QrCode className="mr-2 h-4 w-4 min-w-4" /> Pix
                </div>
                <div className="flex flex-row items-center">
                  <CreditCard className="mr-2 h-4 w-4 min-w-4" /> Cartão
                </div>
                <div className="flex flex-row items-center">
                  <FileText className="mr-2 h-4 w-4 min-w-4" /> Boleto
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 font-semibold text-zinc-900">Envio</div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 min-w-4" />
                Correios / Todo o Brasil
              </div>
            </div>

            <div>
              <div className="mb-2 font-semibold text-zinc-900">Segurança</div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 min-w-4" />
                <ShieldCheck className="h-4 w-4 min-w-4" />
                Conexão segura (SSL)
              </div>
            </div>
          </div>
        </div>
      </Container>

      <div className="flex flex-col items-center justify-center gap-3 border-t border-[var(--rose-100)] px-4 py-6 sm:flex-row sm:gap-10 sm:px-8">
        <div className="text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} {contact.storeName}
        </div>

        <div className="text-sm text-[var(--text-muted)]">
          Dúvidas?{" "}
          {contact.whatsappUrl ? (
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-[var(--green-500)]"
            >
              Fale comigo no WhatsApp
            </a>
          ) : (
            <Link
              href="/contato"
              className="transition hover:text-[var(--green-500)]"
            >
              Fale comigo
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}