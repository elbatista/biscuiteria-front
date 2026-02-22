import Container from "../Container";
import Button from "../Button";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import ProductCard from "../ProductCard";

type BestSeller = {
  name: string;
  price: number;
  slug: string;
  image: string;
  badge?: string;
  linkext?: string;
};

const bestSellers: BestSeller[] = [
  {
    name: "Enfeite Cuia Mini Margaridas",
    price: 10,
    slug: "enfeite-cuia-mini-margaridas",
    image: "/bestsellers/1.jpeg",
    badge: "Top 1",
    linkext: "https://shopee.com.br/product/486802869/15160866047"
  },
  {
    name: "Enfeite Cuia Budinha",
    price: 17,
    slug: "enfeite-cuia-budinha",
    image: "/bestsellers/2.jpeg",
    // badge: "Mais pedido",
    linkext: "https://shopee.com.br/product/486802869/13394332220"
  },
  {
    name: "Enfeite Cuia Caixote Flor",
    price: 13,
    slug: "enfeite-caixote-flor",
    image: "/bestsellers/3.jpeg",
    badge: "Personalizável",
    linkext: "https://www.elo7.com.br/enfeite-cuia-caixote-flor/dp/1968533"
  },
  {
    name: "Enfeite Cuia Ursinho",
    price: 15,
    slug: "enfeite-cuia-ursinho",
    image: "/bestsellers/4.jpeg",
    badge: "Personalizável",
    linkext: "https://www.elo7.com.br/enfeite-de-cuia-biscuit-ursinho/dp/1AFFE7D"
  },
];


export default function BestSellersSection() {
  return (
    <Section color="rose">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Favoritos da loja"
              title="Mais vendidos"
              subtitle="Os queridinhos que mais saem — perfeitos para presentear ou deixar seu chimarrão ainda mais especial."/>

            <div className="hidden lg:flex gap-3">
              <Button target="_blank" href="https://shopee.com.br/eqsp7sw1n5?categoryId=100636&entryPoint=ShopByPDP&itemId=13394332220" variant="secondary">Ver tudo</Button>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {bestSellers.map(p => <ProductCard key={p.slug} name={p.name} price={p.price} slug={p.slug} image={p.image} badge={p.badge} linkext={p.linkext} />)}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              Quer algo único? Faça uma encomenda do seu jeito.
            </p>
            <Button variant="secondary" href="/personalizados">Fazer encomenda personalizada</Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
