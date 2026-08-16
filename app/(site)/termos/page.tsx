import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Link from "next/link";
import Button from "@/components/Button";
import {
  FalarWhats,
  InnerSection,
  LastUpdate,
  P,
  SectionHeading,
  SubHeading,
  Ul,
} from "@/components/LegalSections";

export const metadata = {
  title: "Termos de Uso | Biscuit_eria",
  description:
    "Termos e condições para uso do site e compra de peças artesanais sob encomenda na Biscuit_eria.",
};

export default function TermosDeUsoPage() {
  const brand =
    "Biscuit_eria";

  const lastUpdated =
    "Agosto de 2026";

  const legalName =
    process.env.NEXT_PUBLIC_RAZAO_SOCIAL ||
    brand;

  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_URL;

  /**
   * Regras comerciais atuais.
   */
  const productionTime =
    "5 a 20 dias úteis, podendo variar conforme o tipo, a quantidade e a complexidade das peças";

  const customizationPolicy =
    "pode incluir alinhamentos e ajustes antes da finalização. Alterações solicitadas depois do início ou avanço da produção poderão não ser possíveis ou poderão ter custo adicional";

  const paymentMethods =
    "as formas e instruções de pagamento são combinadas diretamente após o envio do pedido";

  const shippingMethods =
    "a modalidade e o valor do envio são definidos individualmente para cada pedido";

  const shippingCoverage =
    "as localidades atendidas dependem da disponibilidade de entrega para o endereço informado";

  const returnsPolicyPath =
    "/trocas";

  return (
    <div className="bg-white">
      <Container>
        <div className="py-14 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <Badge>
              Termos de Uso
            </Badge>

            <h1 className="font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Termos e condições
            </h1>

            <P>
              Estes Termos de Uso regulam o acesso e
              uso do site da{" "}
              <strong>{brand}</strong> e as condições
              aplicáveis aos pedidos de peças
              artesanais, incluindo itens sob
              encomenda e personalizações.
            </P>

            <LastUpdate>
              {lastUpdated}
            </LastUpdate>

            <div className="space-y-10 pt-6">
              {/* 1. Aceite */}
              <InnerSection>
                <SectionHeading>
                  1) Aceite dos Termos
                </SectionHeading>

                <P>
                  Ao acessar ou utilizar o site e ao
                  enviar um pedido, você declara que
                  leu e concorda com estes Termos e
                  com a{" "}
                  <Link
                    href="/politica"
                    className="font-semibold text-[var(--green-500)] underline-offset-4 hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </P>
              </InnerSection>

              {/* 2. Quem somos */}
              <InnerSection>
                <SectionHeading>
                  2) Quem somos
                </SectionHeading>

                <P>
                  O site e os produtos são oferecidos
                  por{" "}
                  <strong>
                    {legalName}
                  </strong>
                  . Para contato, utilize{" "}
                  <strong>
                    {contactEmail ||
                      "a página de contato"}
                  </strong>{" "}
                  ou{" "}
                  <FalarWhats
                    href={
                      whatsappHref
                    }
                  />
                  .
                </P>
              </InnerSection>

              {/* 3. Uso do site */}
              <InnerSection>
                <SectionHeading>
                  3) Uso do site
                </SectionHeading>

                <Ul>
                  <li>
                    Você concorda em utilizar o site
                    de forma lícita e respeitosa, sem
                    tentar violar sua segurança,
                    acessar áreas restritas sem
                    autorização, coletar dados
                    indevidamente ou interferir no seu
                    funcionamento.
                  </li>

                  <li>
                    Poderemos limitar ou bloquear
                    acessos em caso de suspeita de
                    fraude, abuso, tentativa de
                    invasão ou utilização que possa
                    comprometer o site ou terceiros.
                  </li>
                </Ul>
              </InnerSection>

              {/* 4. Produtos */}
              <InnerSection>
                <SectionHeading>
                  4) Produtos, fotos e disponibilidade
                </SectionHeading>

                <P>
                  Nossas peças são artesanais. Por
                  essa razão, podem existir pequenas
                  variações de cor, textura,
                  acabamento, formato e outros
                  detalhes entre as imagens
                  apresentadas e a peça final. Essas
                  variações naturais fazem parte do
                  processo manual de produção e não
                  caracterizam necessariamente
                  defeito.
                </P>

                <Ul>
                  <li>
                    Fotografias podem apresentar
                    pequenas diferenças de cor em
                    razão de iluminação, fotografia e
                    configuração de telas.
                  </li>

                  <li>
                    A disponibilidade dos produtos e
                    os prazos de produção podem
                    variar, especialmente em períodos
                    de maior demanda.
                  </li>

                  <li>
                    Caso um produto deixe de estar
                    disponível após o envio de um
                    pedido, entraremos em contato para
                    informar as alternativas
                    disponíveis.
                  </li>
                </Ul>
              </InnerSection>

              {/* 5. Pedido */}
              <InnerSection>
                <SectionHeading>
                  5) Pedidos e personalização
                </SectionHeading>

                <SubHeading>
                  a) Envio do pedido
                </SubHeading>

                <P>
                  O envio do pedido pelo site registra
                  sua solicitação e os produtos
                  selecionados. Depois disso, poderão
                  ser definidos ou confirmados dados
                  complementares, como valor e forma
                  de envio e instruções de pagamento.
                </P>

                <P>
                  A criação do pedido no site, por si
                  só, não significa necessariamente
                  que o pagamento foi recebido ou que
                  a produção já foi iniciada.
                </P>

                <SubHeading>
                  b) Prazo de produção
                </SubHeading>

                <P>
                  O prazo estimado de produção é de{" "}
                  <strong>
                    {productionTime}
                  </strong>
                  .
                </P>

                <P>
                  O prazo poderá ser informado ou
                  ajustado conforme características
                  específicas do pedido, períodos de
                  alta demanda, necessidade de
                  aprovação de detalhes ou outras
                  situações previamente comunicadas.
                </P>

                <SubHeading>
                  c) Personalização e ajustes
                </SubHeading>

                <P>
                  O processo de personalização{" "}
                  {customizationPolicy}.
                </P>

                <SubHeading>
                  d) Conteúdo enviado pelo cliente
                </SubHeading>

                <P>
                  Ao enviar imagens, textos, nomes,
                  referências, logotipos ou outros
                  conteúdos para personalização, você
                  declara possuir autorização ou
                  direito para utilizá-los na
                  finalidade solicitada.
                </P>

                <P>
                  Poderemos recusar solicitações que
                  sejam ilícitas, ofensivas ou que
                  apresentem risco evidente de
                  violação de direitos de terceiros.
                </P>
              </InnerSection>

              {/* 6. Preços e pagamento */}
              <InnerSection>
                <SectionHeading>
                  6) Preços e pagamento
                </SectionHeading>

                <Ul>
                  <li>
                    Os valores apresentados no site
                    podem ser alterados para novos
                    pedidos sem aviso prévio.
                    Alterações posteriores não mudam o
                    valor dos itens de um pedido já
                    confirmado, salvo ajuste
                    solicitado pelo próprio cliente.
                  </li>

                  <li>
                    O valor inicialmente apresentado
                    no checkout pode não incluir
                    frete, quando este ainda depender
                    de definição posterior.
                  </li>

                  <li>
                    <strong>
                      {paymentMethods}.
                    </strong>
                  </li>

                  <li>
                    O pedido somente avançará para a
                    etapa de pagamento confirmado
                    depois que o recebimento for
                    efetivamente confirmado.
                  </li>

                  <li>
                    A produção poderá depender da
                    confirmação do pagamento, salvo
                    quando houver acordo diferente
                    informado expressamente ao
                    cliente.
                  </li>
                </Ul>
              </InnerSection>

              {/* 7. Frete */}
              <InnerSection>
                <SectionHeading>
                  7) Envio e entrega
                </SectionHeading>

                <P>
                  Para os pedidos realizados pelo
                  site,{" "}
                  <strong>
                    {shippingMethods}
                  </strong>
                  . Depois de definido, o valor do
                  frete é incluído no total do pedido
                  e a informação é disponibilizada ao
                  cliente.
                </P>

                <P>
                  Quanto à abrangência,{" "}
                  <strong>
                    {shippingCoverage}
                  </strong>
                  .
                </P>

                <Ul>
                  <li>
                    O prazo total para recebimento
                    normalmente envolve{" "}
                    <strong>
                      prazo de produção + prazo de transporte
                    </strong>
                    .
                  </li>

                  <li>
                    O cliente é responsável por
                    informar corretamente o endereço
                    de entrega e demais dados
                    necessários.
                  </li>

                  <li>
                    Endereço incompleto, incorreto ou
                    impossibilidade de recebimento
                    poderá gerar atraso, devolução e
                    eventual custo adicional de
                    reenvio.
                  </li>

                  <li>
                    Quando houver código ou link de
                    rastreamento, ele poderá ser
                    disponibilizado na página pública
                    do pedido ou enviado ao cliente.
                  </li>

                  <li>
                    Depois que o pedido é entregue ao
                    prestador responsável pelo
                    transporte, o prazo de entrega
                    também depende da operação desse
                    terceiro.
                  </li>
                </Ul>

                <P>
                  Veja também as informações
                  disponíveis em{" "}
                  <Link
                    href={
                      returnsPolicyPath
                    }
                    className="font-semibold text-[var(--green-500)] underline-offset-4 hover:underline"
                  >
                    Trocas &amp; Envio
                  </Link>
                  .
                </P>
              </InnerSection>

              {/* 8. Trocas */}
              <InnerSection>
                <SectionHeading>
                  8) Trocas, devoluções, cancelamentos e peças sob encomenda
                </SectionHeading>

                <P>
                  Como trabalhamos com produtos
                  artesanais e podemos produzir peças
                  personalizadas ou feitas sob
                  encomenda, determinadas situações
                  exigem análise específica de acordo
                  com a natureza do produto, o estágio
                  da produção e a legislação
                  aplicável.
                </P>

                <P>
                  As orientações comerciais
                  disponíveis no site estão descritas
                  em{" "}
                  <Link
                    href={
                      returnsPolicyPath
                    }
                    className="font-semibold text-[var(--green-500)] underline-offset-4 hover:underline"
                  >
                    Trocas &amp; Envio
                  </Link>
                  .
                </P>

                <Ul>
                  <li>
                    Caso o produto chegue com avaria,
                    defeito aparente ou problema
                    relacionado ao transporte, entre
                    em contato assim que possível e
                    envie, quando possível, fotos da
                    embalagem e da peça.
                  </li>

                  <li>
                    Em peças personalizadas, pedidos
                    de mudança ou cancelamento após o
                    início da produção poderão
                    depender do estágio em que o
                    trabalho se encontra e das regras
                    legalmente aplicáveis.
                  </li>

                  <li>
                    O cancelamento administrativo de
                    um pedido não representa
                    automaticamente estorno ou
                    reembolso de valores já pagos.
                    Quando houver pagamento anterior,
                    eventual devolução será tratada
                    separadamente conforme a situação
                    concreta e a legislação
                    aplicável.
                  </li>
                </Ul>
              </InnerSection>

              {/* 9. Acompanhamento */}
              <InnerSection>
                <SectionHeading>
                  9) Acompanhamento do pedido
                </SectionHeading>

                <P>
                  Após o registro do pedido, poderá
                  ser disponibilizada uma página
                  individual para acompanhamento das
                  principais etapas, como criação do
                  pedido, definição do frete,
                  confirmação do pagamento, produção
                  e envio.
                </P>

                <P>
                  O link de acompanhamento é destinado
                  ao cliente. Recomendamos que ele não
                  seja publicado ou compartilhado
                  desnecessariamente com terceiros.
                </P>
              </InnerSection>

              {/* 10. Comunicação */}
              <InnerSection>
                <SectionHeading>
                  10) Comunicações sobre o pedido
                </SectionHeading>

                <P>
                  Poderemos utilizar o e-mail,
                  WhatsApp ou outros dados de contato
                  informados para enviar mensagens
                  necessárias ao atendimento e ao
                  andamento do pedido, como definição
                  de frete, confirmação de pagamento,
                  início da produção, envio,
                  rastreamento ou necessidade de
                  esclarecer informações.
                </P>
              </InnerSection>

              {/* 11. Propriedade intelectual */}
              <InnerSection>
                <SectionHeading>
                  11) Propriedade intelectual
                </SectionHeading>

                <P>
                  O conteúdo do site, incluindo textos,
                  fotografias próprias, identidade
                  visual, logotipo e layout, pertence
                  à {brand} ou é utilizado com a
                  devida autorização, conforme
                  aplicável.
                </P>

                <P>
                  Não é permitida sua reprodução,
                  distribuição ou utilização comercial
                  não autorizada, sem prejuízo das
                  utilizações permitidas pela
                  legislação.
                </P>
              </InnerSection>

              {/* 12. Disponibilidade */}
              <InnerSection>
                <SectionHeading>
                  12) Disponibilidade e responsabilidade
                </SectionHeading>

                <Ul>
                  <li>
                    O site poderá ficar
                    temporariamente indisponível por
                    manutenção, atualização,
                    indisponibilidade de fornecedores
                    de infraestrutura ou outros
                    eventos técnicos.
                  </li>

                  <li>
                    Buscamos manter as informações
                    corretas e atualizadas, mas erros
                    técnicos ou materiais poderão ser
                    corrigidos quando identificados.
                  </li>

                  <li>
                    A responsabilidade por atos de
                    terceiros, incluindo prestadores
                    de transporte, serviços
                    financeiros e plataformas
                    tecnológicas, será analisada
                    conforme as circunstâncias e a
                    legislação aplicável, sem prejuízo
                    dos direitos do consumidor.
                  </li>
                </Ul>
              </InnerSection>

              {/* 13. Privacidade */}
              <InnerSection>
                <SectionHeading>
                  13) Privacidade e dados pessoais
                </SectionHeading>

                <P>
                  O tratamento de dados pessoais
                  relacionado ao site e aos pedidos é
                  descrito em nossa{" "}
                  <Link
                    href="/politica"
                    className="font-semibold text-[var(--green-500)] underline-offset-4 hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </P>
              </InnerSection>

              {/* 14. Alterações */}
              <InnerSection>
                <SectionHeading>
                  14) Alterações destes Termos
                </SectionHeading>

                <P>
                  Estes Termos poderão ser atualizados
                  para refletir alterações
                  operacionais, tecnológicas,
                  comerciais ou legais.
                </P>

                <P>
                  A versão vigente será publicada
                  nesta página juntamente com a data
                  da última atualização.
                </P>
              </InnerSection>

              {/* 15. Contato */}
              <InnerSection>
                <SectionHeading>
                  15) Contato
                </SectionHeading>

                <P>
                  Se tiver dúvidas sobre estes Termos,
                  sobre seu pedido ou sobre o
                  funcionamento do site, fale com a
                  gente.
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