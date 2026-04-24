import BestSellersSection from "@/components/home/BestSellers";
import Hero from "@/components/home/Hero";
import Relate from "@/components/home/Relate";
import Collections from "@/components/home/Collections";
import TheProcess from "@/components/home/TheProcess";
import Customization from "@/components/home/Customization";
import SocialProof from "@/components/home/SocialProof";
import Cta from "@/components/home/Cta";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--rose-50)] text-[var(--text-main)]">
      <Hero />
      <Collections />
      <BestSellersSection />
      <Relate />
      <TheProcess />
      <Customization />
      <SocialProof />
      <Cta />
    </div>
  );
}