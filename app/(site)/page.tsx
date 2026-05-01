import Hero from "@/components/home/Hero";
import StartHere from "@/components/home/StartHere";
import TheProcess from "@/components/home/TheProcess";
import Occasions from "@/components/home/Occasions";
import Customization from "@/components/home/Customization";
import SocialProof from "@/components/home/SocialProof";
import FinalCta from "@/components/home/FinalCta";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--rose-50)] text-[var(--text-main)]">
      <Hero />
      <StartHere />
      <TheProcess />
      <Occasions />
      <Customization />
      <SocialProof />
      <FinalCta />
    </div>
  );
}