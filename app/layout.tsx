// import type { Metadata } from "next";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "Biscuit_eria | Peças artesanais em biscuit",
//   description:
//     "Peças artesanais em biscuit feitas à mão para decorar, presentear e encantar. Encomendas personalizadas e pronta-entrega.",
//   metadataBase: new URL("https://biscuit-eria.com"), // troque pelo seu domínio quando tiver
//   openGraph: {
//     title: "Biscuit_eria",
//     description:
//       "Peças artesanais em biscuit feitas à mão para decorar, presentear e encantar.",
//     type: "website",
//     locale: "pt_BR",
//   },
//   robots: {
//     index: true,
//     follow: true,
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="pt-BR">
//       <body>{children}</body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Biscuit_eria — Afeto moldado à mão",
  description:
    "Peças artesanais em biscuit feitas à mão para celebrar pessoas, momentos e memórias.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${playfair.variable} min-h-screen bg-rose-50 text-zinc-800 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
