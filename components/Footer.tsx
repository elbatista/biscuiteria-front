// import Container from './Container';
// import Link from 'next/link';

// const Footer = () => (
//     <footer className="border-t border-[var(--rose-100)] py-10 bg-[var(--rose-50)]">
//         <Container>
//           <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
//             <div className="text-sm text-[var(--text-muted)]">
//               <div className="font-playfair font-semibold text-zinc-900">
//                 Biscuit_eria
//               </div>
//               <div className="mt-1">Peças artesanais em biscuit — feitas à mão.</div>
//             </div>
//             <div className="flex flex-wrap gap-4 text-sm">
//               <Link
//                 className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
//                 href="/politica">
//                 Política
//               </Link>
//               <Link
//                 className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
//                 href="/trocas">
//                 Trocas &amp; Envio
//               </Link>
//               <Link
//                 className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
//                 href="/contato">
//                 Contato
//               </Link>
//             </div>
//           </div>
//         </Container>
//     </footer>
// );

// export default Footer;
import Container from "./Container";
import Link from "next/link";
import {
  Instagram,
  MessageCircle,
  // Pinterest,
  CreditCard,
  QrCode,
  FileText,
  Truck,
  Lock,
  ShieldCheck,
} from "lucide-react";

const insta = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const whats = process.env.NEXT_PUBLIC_WHATSAPP_URL;

const Footer = () => (
  <footer className="border-t border-[var(--rose-100)] bg-[var(--rose-50)]">
    <Container wfull>
      <div className="py-12 grid gap-5 grid-cols-2 lg:grid-cols-6">
        {/* Brand + Social */}
        <div className="space-y-4 lg:col-span-2">
          <div className="font-playfair font-semibold text-zinc-900">
            Biscuit_eria
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-sm">
            Enfeites personalizados em biscuit, cuias e acessórios para o seu chimarrão. <span className="text-xl">🧉</span>
          </p>

          <div className="flex items-center gap-4 pt-2">
            <a
              href={insta}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
            >
              <Instagram className="w-5 h-5" />
            </a>

            <a
              href={whats}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Sitemap */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-zinc-900">Mapa do site</div>
          <nav className="grid gap-2 text-sm">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Início
            </Link>
            <Link href="/loja" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Loja
            </Link>
            <Link href="/personalizados" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Personalizados
            </Link>
            <Link href="/sobre" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Sobre
            </Link>
            <Link href="/contato" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Contato
            </Link>
          </nav>
        </div>

        {/* Policies */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-zinc-900">Políticas</div>
          <nav className="grid gap-2 text-sm">
            <Link href="/politica" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Termos de uso
            </Link>
            <Link href="/trocas" className="text-[var(--text-muted)] hover:text-[var(--green-500)] transition">
              Trocas & Envio
            </Link>
          </nav>
        </div>

        {/* Payment, Shipping & Security */}
        <div className="space-y-5 text-sm text-[var(--text-muted)] lg:col-span-2">
          <div>
            <div className="font-semibold text-zinc-900 mb-2">Pagamento</div>
            <div className="flex items-center gap-3">
              <QrCode className="w-4 h-4" /> Pix
              <CreditCard className="w-4 h-4 ml-3" /> Cartão
              <FileText className="w-4 h-4 ml-3" /> Boleto
            </div>
          </div>

          <div>
            <div className="font-semibold text-zinc-900 mb-2">Envio</div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Correios / Todo o Brasil
            </div>
          </div>

          <div>
            <div className="font-semibold text-zinc-900 mb-2">Segurança</div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <ShieldCheck className="w-4 h-4" />
              Conexão segura (SSL)
            </div>
          </div>
        </div>
      </div>

    </Container>
      {/* Bottom */}
      <div className="px-4 sm:px-8 py-6 border-t border-[var(--rose-100)] flex flex-col gap-3 sm:flex-row items-center justify-center sm:gap-10">
        <div className="text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} Biscuit_eria
        </div>

        <div className="text-sm text-[var(--text-muted)]">
          Dúvidas?{" "}
          <Link href="/contato" className="hover:text-[var(--green-500)] transition">
            Fale comigo
          </Link>
        </div>
      </div>
  </footer>
);

export default Footer;