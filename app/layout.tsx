import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  description: "Peças artesanais em biscuit feitas à mão para celebrar pessoas, momentos e memórias.",
};

export default function RootLayout({children}:{children: React.ReactNode;}){
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} min-h-screen bg-rose-50 text-zinc-800 antialiased`}>
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}