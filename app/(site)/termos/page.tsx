import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Link from "next/link";
import Button from "@/components/Button";
import { FalarWhats, InnerSection, LastUpdate, P, SectionHeading, SubHeading, Ul } from "@/components/LegalSections";

export const metadata = {
  title: "Termos de Uso | Biscuit_eria",
  description:
    "Termos e condições para uso do site e compra de peças artesanais sob encomenda na Biscuit_eria.",
};

export default function TermosDeUsoPage() {

  const brand = "Biscuit_eria";
  const lastUpdated = "Fevereiro de 2026";

  const legalName = process.env.NEXT_PUBLIC_RAZAO_SOCIAL;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const whatsappHref = process.env.NEXT_PUBLIC_WHATSAPP_URL;

  // Regras comerciais (ajuste conforme seu processo real)
  const productionTime = "5 a 20 dias úteis (varia por quantidade de peças)";
  const customizationPolicy =
    "inclui 1 ajuste de detalhes antes de finalizar. Alterações posteriores podem ter custo";
  const paymentMethods = "Pix • Cartão • Boleto"; // ajuste se necessário
  const shippingMethods = "Correios";
  const shippingCoverage = "todo Brasil";
  const returnsPolicyPath = "/trocas";

  return (
    <div className="bg-white">
      <Container>
        <div className="py-14 sm:py-16">
          <div className="space-y-5 max-w-3xl">
            <Badge>Termos de Uso</Badge>

            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
              Termos e condições
            </h1>

            <P>
              Estes Termos de Uso regulam o acesso e uso do site da{" "}
              <strong>{brand}</strong> e as condições aplicáveis a pedidos de peças
              artesanais, incluindo itens sob encomenda e personalizações.
            </P>

            <LastUpdate>{lastUpdated}</LastUpdate>

            <div className="pt-6 space-y-10">
              {/* 1) Aceite */}
              <InnerSection>
                <SectionHeading>1) Aceite dos Termos</SectionHeading>
                <P>
                  Ao acessar, navegar ou comprar por meio do site, você declara que leu,
                  entendeu e concorda com estes Termos e com a{" "}
                  <Link
                    href="/politica"
                    className="font-semibold text-[var(--green-500)] hover:underline underline-offset-4"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </P>
              </InnerSection>

              {/* 2) Quem somos */}
              <InnerSection>
                <SectionHeading>2) Quem somos</SectionHeading>
                <P>
                  O site e os produtos são oferecidos por <strong>{legalName}</strong>.
                  Para contato, utilize{" "} <strong>{contactEmail || "a página de contato"}</strong> ou{" "}
                  <FalarWhats href={whatsappHref}/>.
                </P>
              </InnerSection>

              {/* 3) Uso do site */}
              <InnerSection>
                <SectionHeading>3) Uso do site</SectionHeading>
                <Ul>
                  <li>
                    Você concorda em usar o site de forma lícita e respeitosa, sem tentar
                    violar segurança, coletar dados indevidos ou interferir no funcionamento.
                  </li>
                  <li>
                    Podemos suspender/limitar acessos em caso de suspeita de fraude, abuso
                    ou uso que comprometa o serviço.
                  </li>
                </Ul>
              </InnerSection>

              {/* 4) Informações e disponibilidade */}
              <InnerSection>
                <SectionHeading>4) Produtos, fotos e disponibilidade</SectionHeading>
                <P>
                  Nossas peças são artesanais. Por isso, pode haver variações naturais de
                  cor, textura e pequenas diferenças entre fotos e o produto final — isso
                  faz parte do processo manual.
                </P>
                <Ul>
                  <li>
                    As imagens do site são ilustrativas e podem sofrer pequenas variações
                    de iluminação.
                  </li>
                  <li>
                    A disponibilidade pode variar, especialmente em datas comemorativas.
                  </li>
                </Ul>
              </InnerSection>

              {/* 5) Encomendas e personalização */}
              <InnerSection>
                <SectionHeading>5) Encomendas e personalização</SectionHeading>

                <SubHeading>a) Como funciona</SubHeading>
                <P>
                  Pedidos personalizados podem exigir alinhamento de referências (fotos,
                  ideias, cores, tema). O prazo de produção estimado é:{" "}
                  <strong>{productionTime}</strong>.
                </P>

                <SubHeading>b) Ajustes e aprovação</SubHeading>
                <P>O processo de personalização {customizationPolicy}</P>

                <SubHeading>c) Conteúdo enviado pelo cliente</SubHeading>
                <P>
                  Se você enviar textos, imagens ou referências, você declara ter direito
                  de uso desse material. Não nos responsabilizamos por solicitações que
                  infrinjam direitos de terceiros (ex.: marcas, personagens protegidos,
                  imagens sem autorização).
                </P>
              </InnerSection>

              {/* 6) Preços e pagamento */}
              <InnerSection>
                <SectionHeading>6) Preços e pagamento</SectionHeading>
                <Ul>
                  <li>
                    Os preços exibidos no site podem mudar sem aviso prévio, mas não
                    alteram pedidos já confirmados.
                  </li>
                  <li>
                    Formas de pagamento aceitas: <strong>{paymentMethods}</strong>.
                  </li>
                  <li>
                    O pedido pode ser confirmado apenas após aprovação do pagamento.
                  </li>
                </Ul>
              </InnerSection>

              {/* 7) Entrega */}
              <InnerSection>
                <SectionHeading>7) Envio e entrega</SectionHeading>
                <P>
                  Enviamos via <strong>{shippingMethods}</strong> para{" "}
                  <strong>{shippingCoverage}</strong>. Prazos de entrega variam conforme
                  localidade, método de envio e período do ano.
                </P>
                <Ul>
                  <li>
                    O prazo total geralmente inclui <strong>produção + transporte</strong>.
                  </li>
                  <li>
                    Endereço incorreto/incompleto pode gerar reenvio e custos adicionais.
                  </li>
                  <li>
                    Em caso de atraso do transportador, ajudamos no acompanhamento, mas o
                    prazo final depende do serviço de entrega.
                  </li>
                </Ul>

                <P>
                  Veja detalhes em{" "}
                  <Link
                    href={returnsPolicyPath}
                    className="font-semibold text-[var(--green-500)] hover:underline underline-offset-4"
                  >
                    Trocas &amp; Envio
                  </Link>
                  .
                </P>
              </InnerSection>

              {/* 8) Trocas, devoluções e peças sob encomenda */}
              <InnerSection>
                <SectionHeading>8) Trocas, devoluções e peças sob encomenda</SectionHeading>
                <P>
                  Como trabalhamos com peças artesanais, especialmente as feitas sob encomenda,
                  aplicam-se regras específicas para troca/cancelamento, conforme descrito em{" "}
                  <Link
                    href={returnsPolicyPath}
                    className="font-semibold text-[var(--green-500)] hover:underline underline-offset-4"
                  >
                    Trocas &amp; Envio
                  </Link>
                  .
                </P>
                <Ul>
                  <li>
                    Se o produto chegar com <strong>defeito</strong> ou avaria no transporte,
                    entre em contato em até <strong>24h</strong> com fotos
                    da embalagem e do item.
                  </li>
                  <li>
                    Para peças personalizadas, mudanças de ideia após início da produção podem
                    não ser possíveis (ou podem gerar custos), pois trata-se de item feito sob
                    demanda.
                  </li>
                </Ul>
              </InnerSection>

              {/* 9) Propriedade intelectual */}
              <InnerSection>
                <SectionHeading>9) Propriedade intelectual</SectionHeading>
                <P>
                  O conteúdo do site (textos, fotos, identidade visual, logotipo, layout)
                  pertence a {brand} ou é usado com autorização. Não é permitido copiar,
                  reproduzir ou distribuir sem permissão por escrito.
                </P>
              </InnerSection>

              {/* 10) Limitação de responsabilidade */}
              <InnerSection>
                <SectionHeading>10) Limitação de responsabilidade</SectionHeading>
                <Ul>
                  <li>
                    Não garantimos que o site estará disponível 100% do tempo (pode haver
                    manutenção/instabilidades).
                  </li>
                  <li>
                    Não nos responsabilizamos por danos indiretos decorrentes de uso indevido
                    do site ou por atrasos imputáveis a terceiros (transportadoras, gateways),
                    sem prejuízo dos seus direitos previstos em lei.
                  </li>
                </Ul>
              </InnerSection>

              {/* 11) Privacidade */}
              <InnerSection>
                <SectionHeading>11) Privacidade e dados pessoais</SectionHeading>
                <P>
                  O tratamento de dados pessoais é regido pela{" "}
                  <Link
                    href="/politica"
                    className="font-semibold text-[var(--green-500)] hover:underline underline-offset-4"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </P>
              </InnerSection>

              {/* 12) Alterações */}
              <InnerSection>
                <SectionHeading>12) Alterações destes Termos</SectionHeading>
                <P>
                  Podemos atualizar estes Termos periodicamente. Quando isso acontecer,
                  publicaremos a versão atualizada nesta página e ajustaremos a data de
                  “Última atualização”.
                </P>
              </InnerSection>

              {/* 14) Contato */}
              <InnerSection>
                <SectionHeading>13) Contato</SectionHeading>
                <P>
                  Se tiver dúvidas sobre estes Termos, fale com a gente.
                </P>

                <div className="pt-2">
                  <Button href="/contato">
                    Ir para contato
                  </Button>
                </div>
              </InnerSection>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}