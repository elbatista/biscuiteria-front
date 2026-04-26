import BestSellersSection from "@/components/home/BestSellers";
import Hero from "@/components/home/Hero";
import Collections from "@/components/home/Collections";
import TheProcess from "@/components/home/TheProcess";
import Customization from "@/components/home/Customization";
import SocialProof from "@/components/home/SocialProof";
import Container from "@/components/Container";
import Section from "@/components/Section";
import FaqPreview from "@/components/faq/FaqPreview";
import { getPublicFaqPreview } from "@/lib/server/public-faq";

export const revalidate = 60*60; // 1 hour

export default async function HomePage() {
  const faqItems = await getPublicFaqPreview(4);

  return (
    <div className="min-h-screen bg-[var(--rose-50)] text-[var(--text-main)]">
      <Hero />
      <Collections />
      <BestSellersSection />
      <TheProcess />
      <Customization />
      <SocialProof />

      {faqItems.length > 0 ? (
        <Section>
          <Container>
            <FaqPreview
              items={faqItems}
              title="Dúvidas frequentes"
              subtitle="Antes de comprar ou pedir uma peça personalizada, veja algumas respostas rápidas."
            />
          </Container>
        </Section>
      ) : null}
    </div>
  );
}