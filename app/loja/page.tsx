import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Section from "@/components/Section";
import SectionTitle from "@/components/SectionTitle";
import LinkCard from "@/components/LinkCard";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { getStoreProducts } from "../../lib/server/products";

export const metadata = {
  title: "Loja | Biscuit_eria",
  description:
    "Conheça os produtos da Biscuit_eria: enfeites e acessórios para chimarrão, peças feitas à mão e itens especiais para deixar seu mate ainda mais bonito.",
};

export default async function LojaPage() {
  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  const instagramHref = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  const products = await getStoreProducts();

  return (
    <div className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <Badge>Loja</Badge>

              <div className="space-y-3">
                <h1 className="font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                  Produtos para deixar seu chimarrão ainda mais especial 🧉✨
                </h1>

                <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                  Aqui você encontra enfeites, acessórios e peças feitas à mão
                  com carinho. A compra direta no site está chegando, mas você já
                  pode conhecer a coleção e escolher os seus favoritos.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-5">
                <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                  <strong className="text-zinc-900">
                    Quer algo personalizado?
                  </strong>{" "}
                  Se você não encontrar exatamente o que procura, pode pedir uma
                  peça sob medida e enviar suas referências pelo WhatsApp.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button target="_blank" href={whatsappHref} variant="primary">
                  Falar no WhatsApp
                </Button>
                <Button target="_blank" href={instagramHref} variant="secondary">
                  Acompanhar no Instagram
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <LinkCard
                title="Peças artesanais"
                description="Cada peça é feita com cuidado nos detalhes, acabamento e combinação das coleções."
                href="/sobre"
                linktext="Conhecer a história"
                tag="🫶"
              />
              <LinkCard
                title="Personalização"
                description="Você pode pedir algo do seu jeito, com tema, cores e detalhes que combinem com a sua cuia."
                href="/personalizados"
                linktext="Pedir personalizado"
                tag="🎨"
              />
              <LinkCard
                title="Lotes pequenos"
                description="Alguns produtos são feitos em pequenas quantidades e podem esgotar rapidamente."
                href="/contato"
                linktext="Tirar dúvidas"
                tag="🌷"
              />
              <LinkCard
                title="Novidades"
                description="Acompanhe as próximas coleções, lançamentos e peças especiais pelo Instagram."
                href={instagramHref || "#"}
                linktext="Ver novidades"
                tag="✨"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionTitle
            eyebrow="Catálogo"
            title="Produtos disponíveis"
            subtitle="Veja os produtos disponíveis hoje. Em breve, a compra será feita diretamente aqui no site."
          />

          {products.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[var(--rose-100)] bg-white/70 p-6">
              <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Ainda estamos cadastrando os primeiros produtos. Volte em breve
                ou fale comigo no WhatsApp para ver opções disponíveis.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  name={product.name}
                  price={product.priceInCents / 100}
                  priceInCents={product.priceInCents}
                  slug={product.slug}
                  image={product.image}
                  badge={product.featured ? "Destaque" : undefined}
                  available={product.available}
                />
              ))}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-[var(--rose-100)] bg-white/60 p-5">
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
              <strong className="text-zinc-900">
                Não achou exatamente o que queria?
              </strong>{" "}
              Você pode pedir um produto personalizado. É só{" "}
              <Link
                href="/personalizados"
                className="text-[var(--green-500)] hover:underline"
              >
                preencher o formulário
              </Link>{" "}
              e enviar as referências.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-100)] p-8 sm:p-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div className="space-y-3">
                <h2 className="font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                  Quer acompanhar os próximos lançamentos?
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                  Me chama no WhatsApp ou acompanha no Instagram para ver novas
                  coleções, peças especiais e produtos personalizados.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Button target="_blank" href={whatsappHref} variant="primary">
                  Falar no WhatsApp
                </Button>
                <Button target="_blank" href={instagramHref} variant="secondary">
                  Ir para o Instagram
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}