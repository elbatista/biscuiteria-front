// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Biscuit_eria",
//   description: "Biscuit_eria - O seu e-commerce de biscuits",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="pt-br">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }

// app/layout.tsx
// Next.js App Router + next/font (Playfair Display + Inter)
// Tailwind: usa as variáveis CSS --font-sans e --font-serif
// e aplica globalmente via className no <html>.
//
// Pré-requisitos:
// 1) Tailwind instalado e funcionando
// 2) Em tailwind.config.ts, mapear as fontes (veja o bloco abaixo)

import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Cormorant_Garamond } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Biscuit_eria",
  description: "Peças artesanais em biscuit feitas à mão para decorar, presentear e encantar.",
  icons: {
    icon: "./icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased bg-white text-zinc-900">{children}</body>
    </html>
  );
}
