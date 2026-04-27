import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Biscuit_eria | Tudo para o seu chimarrão",
  description: "Peças artesanais em biscuit feitas à mão para celebrar pessoas, momentos e memórias.",
};

export default function RootLayout({children}:{children: React.ReactNode;}){
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} min-h-screen bg-rose-50 text-zinc-800 antialiased`}>
        <Navbar/>
        {children}
        <Footer/>
        <CookieBanner/>
        <Analytics />
      </body>
    </html>
  );
}