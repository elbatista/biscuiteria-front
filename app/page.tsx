import Hero from "@/components/home/Hero";
import TheProcess from "@/components/home/TheProcess";
import Customization from "@/components/home/Customization";
import SocialProof from "@/components/home/SocialProof";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--rose-50)] text-[var(--text-main)]">
      <Hero />
      <TheProcess />
      <Customization />
      <SocialProof />
    </div>
  );
}