import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CookieBanner />
    </>
  );
}