import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Link from "next/link";
import Button from "@/components/Button";
import { InnerSection, LastUpdate, Note, P, SectionHeading, SubHeading, Ul } from "@/components/LegalSections";
import FaqPreview from "@/components/faq/FaqPreview";
import Section from "@/components/Section";

export const metadata = {
  title: "Trocas & Envio | Biscuit_eria",
  description:
    "Saiba como funcionam envio, prazos, trocas, devoluções, cancelamentos e avarias em pedidos da Biscuit_eria.",
};

export default function TrocasEEnvioPage() {

  const shippingMethods = "Correios";
  const shippingCoverage = "todo Brasil";

  // Regras sugeridas (você ajusta)
  const damageReportWindow = "24 horas";
  const wrongItemWindow = "48 horas";
  const cancellationBeforeProduction = "até 24 horas após confirmação do pedido";
  const customizationCancellationRule =
    "Após início da produção não é possível cancelar peças personalizadas; antes disso, avaliamos caso a caso.";
  const returnShippingCostRule =
    "Em caso de defeito/erro nosso, arcamos com frete; em outros casos, o frete é pago pelo cliente.";

  return (
    <div className="bg-white">
      <Container>
        <div className="py-14 sm:py-16">
          <div className="space-y-5 max-w-3xl">
            <Badge>Trocas &amp; Envio</Badge>

            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
              Entregas, prazos e trocas sem stress
            </h1>

            <P>
              Aqui você encontra informações sobre <strong>prazos</strong>, <strong>envio</strong>,{" "}
              <strong>avarias</strong>, <strong>trocas</strong> e <strong>cancelamentos</strong>.
              Como nossas peças são artesanais (muitas sob encomenda), algumas regras são diferentes de produtos
              industrializados — e a gente explica tudo com transparência.
            </P>

            <LastUpdate>Fevereiro de 2026</LastUpdate>

            <div className="pt-6 space-y-10">
              {/* 1) Prazos */}
              <InnerSection>
                <SectionHeading>1) Prazos: produção + envio</SectionHeading>

                <SubHeading>a) Prazo de produção</SubHeading>
                <P>
                  A maioria das peças é feita sob encomenda. O prazo estimado de produção é:
                </P>
                <P><strong>Varejo 5 dias</strong></P> 
                <P><strong>Atacado 20 dias</strong></P>

                <SubHeading>b) Prazo de envio (transporte)</SubHeading>
                <P>
                  Após a postagem, o prazo de entrega passa a depender do serviço de transporte escolhido (
                  <strong>{shippingMethods}</strong>) e da sua localidade.
                </P>

                <Note>
                  <strong>Importante:</strong> o prazo total normalmente é{" "}
                  <strong>produção + transporte</strong>. Em datas comemorativas (Dia das Mães, Natal etc.),
                  recomendamos comprar com antecedência.
                </Note>
              </InnerSection>

              {/* 2) Envio */}
              <InnerSection>
                <SectionHeading>2) Envio e rastreio</SectionHeading>
                <P>
                  Enviamos para <strong>{shippingCoverage}</strong> via <strong>{shippingMethods}</strong>.
                  Assim que o pedido for postado, você receberá o código de rastreio (quando disponível).
                </P>
                <Ul>
                  <li>
                    Certifique-se de preencher o endereço corretamente. Endereço incompleto/incorreto pode gerar
                    devolução e reenvio com custo adicional.
                  </li>
                  <li>
                    Se o pedido voltar por ausência do destinatário, podemos reenviar após o pagamento de um novo frete.
                  </li>
                </Ul>
              </InnerSection>

              {/* 3) Embalagem */}
              <InnerSection>
                <SectionHeading>3) Embalagem e cuidados</SectionHeading>
                <P>
                  Nossas peças são delicadas. Embalamos com cuidado para reduzir riscos de transporte, mas podem ocorrer
                  avarias. Por isso, recomendamos:
                </P>
                <Ul>
                  <li>Gravar um vídeo abrindo a caixa (ajuda muito em caso de avaria).</li>
                  <li>Guardar a embalagem até confirmar que está tudo certo.</li>
                </Ul>
              </InnerSection>

              {/* 4) Avaria */}
              <InnerSection>
                <SectionHeading>4) Produto avariado no transporte</SectionHeading>
                <P>
                  Se seu pedido chegar com avaria, fale com a gente em até{" "}
                  <strong>{damageReportWindow}</strong> após o recebimento.
                </P>
                <Ul>
                  <li>Envie fotos (e se possível vídeo) do produto e da embalagem.</li>
                  <li>Informe seu nome, número do pedido e o que aconteceu.</li>
                </Ul>

                <Note>
                  Depois da análise, podemos oferecer (conforme o caso):{" "}
                  <strong>reparo</strong>, <strong>reposição</strong> (se viável) ou{" "}
                  <strong>estorno</strong>. A solução depende do tipo de avaria e da disponibilidade da peça/material.
                </Note>
              </InnerSection>

              {/* 5) Defeito ou erro */}
              <InnerSection>
                <SectionHeading>5) Defeito de fabricação ou item errado</SectionHeading>
                <P>
                  Se você recebeu um item diferente do que foi pedido, ou identificar um defeito não relacionado ao transporte,
                  entre em contato em até <strong>{wrongItemWindow}</strong>.
                </P>
                <Ul>
                  <li>Conte o que aconteceu e envie fotos para avaliação.</li>
                  <li>Se confirmado erro nosso, cuidaremos da solução e orientaremos os próximos passos.</li>
                </Ul>
              </InnerSection>

              {/* 6) Troca por gosto / arrependimento */}
              <InnerSection>
                <SectionHeading>6) Troca por gosto / arrependimento</SectionHeading>
                <P>
                  Como grande parte dos nossos produtos é feita sob encomenda, especialmente os personalizados,
                  trocas por gosto (“não era bem isso que eu imaginei”) podem não ser possíveis.
                </P>
              </InnerSection>

              {/* 7) Cancelamento */}
              <InnerSection>
                <SectionHeading>7) Cancelamento</SectionHeading>

                <SubHeading>a) Antes do início da produção</SubHeading>
                <P>
                  Cancelamentos podem ser solicitados até <strong>{cancellationBeforeProduction}</strong>, desde que a produção
                  ainda não tenha iniciado.
                </P>

                <SubHeading>b) Peças personalizadas</SubHeading>
                <P>{customizationCancellationRule}</P>
              </InnerSection>

              {/* 8) Custos de frete */}
              <InnerSection>
                <SectionHeading>8) Custos de frete em trocas/devoluções</SectionHeading>
                <P>{returnShippingCostRule}</P>
              </InnerSection>

              {/* 9) Como solicitar */}
              <InnerSection>
                <SectionHeading>9) Como solicitar troca, suporte ou reenvio</SectionHeading>
                <P>
                  Para agilizar, envie:
                </P>
                <Ul>
                  <li>Nome completo e número do pedido</li>
                  <li>Descrição do problema</li>
                  <li>Fotos (e vídeo, se tiver) do item e da embalagem</li>
                </Ul>

                <div className="pt-2">
                  <Button href="/contato">
                    Ir para contato
                  </Button>
                </div>
              </InnerSection>

              {/* Link útil */}
              <InnerSection>
                <P>
                  Você também pode consultar nossos{" "}
                  <Link
                    href="/termos"
                    className="font-semibold text-[var(--green-500)] hover:underline underline-offset-4"
                  >
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    href="/politica"
                    className="font-semibold text-[var(--green-500)] hover:underline underline-offset-4"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </P>
              </InnerSection>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}