import Container from "../Container";
import Button from "../Button";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import ProductCard from "../ProductCard";
import { getHomeBestSellers } from "@/lib/server/home";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";

export default async function BestSellersSection() {
  const [bestSellers, contact] = await Promise.all([
    getHomeBestSellers(4),
    getPublicStoreContactSettings(),
  ]);

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <Section color="rose">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Favoritos da loja"
              title="Mais vendidos"
              subtitle="Os produtos que os clientes mais compraram até agora."
            />

            <div className="hidden gap-3 lg:flex">
              <Button href="/loja" variant="secondary">
                Ver loja completa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {bestSellers.map((product, index) => (
              <ProductCard
                key={product.slug}
                productId={product.id}
                name={product.name}
                price={product.priceInCents / 100}
                priceInCents={product.priceInCents}
                slug={product.slug}
                image={product.image}
                badge={index === 0 ? "Top 1" : "Mais vendido"}
                canAcceptOrders={contact.canAcceptOrders}
                orderUnavailableReason={contact.orderUnavailableReason}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              Quer explorar mais opções ou encontrar algo sob medida?
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" href="/loja">
                Ver todos os produtos
              </Button>
              <Button variant="primary" href="/personalizados">
                Fazer encomenda personalizada
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}