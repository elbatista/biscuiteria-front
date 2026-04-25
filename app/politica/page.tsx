import Container from "@/components/Container";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { FalarWhats, InnerSection, LastUpdate, P, SectionHeading, SubHeading, Ul } from "@/components/LegalSections";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";

export const metadata = {
  title: "Política de Privacidade | Biscuit_eria",
  description: "Saiba como a Biscuit_eria coleta, usa e protege seus dados pessoais, e como você pode exercer seus direitos.",
};

export default async function PoliticaDePrivacidadePage() {
  const contact = await getPublicStoreContactSettings();

  const lastUpdated = "Fevereiro de 2026";
  const brand = contact.storeName;
  const controllerName = process.env.NEXT_PUBLIC_RAZAO_SOCIAL || contact.storeName;
  const controllerAddress = "São Leopoldo, RS, Brasil";
  const contactEmail = contact.contactEmail;
  const whatsappHref = contact.whatsappUrl;

  // Terceiros / ferramentas (preencher só o que você usa)
  const paymentProvider = "Mercado Pago / PagSeguro";
  const analyticsTools = "Google Analytics / Vercel";
  const hostingProvider = "Vercel";
  const shippingProviders = "Correios";
  const crmEmailTool = "Render";

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <main className="py-14 sm:py-16">
          <div className="space-y-5 max-w-3xl">
            <Badge>Política de Privacidade</Badge>

            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
              Como cuidamos dos seus dados
            </h1>

            <P>
              Esta Política de Privacidade explica como a <strong>{brand}</strong> coleta, usa,
              compartilha e protege dados pessoais quando você visita nosso site, entra em contato,
              faz um pedido ou solicita uma personalização. Ela também descreve seus direitos e como
              exercê-los.
            </P>

            <LastUpdate>{lastUpdated}</LastUpdate>

            <div className="pt-6 space-y-10">
              {/* 1. Quem somos */}
              <InnerSection>
                <SectionHeading>1) Quem é o responsável pelo tratamento</SectionHeading>
                <P>
                  <strong>Controladora:</strong> {controllerName}
                  <br />
                  <strong>Local:</strong> {controllerAddress}
                  <br />
                  <strong>E-mail:</strong> {contactEmail}
                  <br />
                  <FalarWhats href={whatsappHref} />
                </P>
              </InnerSection>

              {/* 2. Quais dados coletamos */}
              <InnerSection>
                <SectionHeading>2) Quais dados pessoais coletamos</SectionHeading>

                <SubHeading>a) Dados que você fornece</SubHeading>
                <Ul>
                  <li><strong>Contato:</strong> nome, e-mail, telefone/WhatsApp, mensagem enviada no formulário.</li>
                  <li>
                    <strong>Pedido:</strong> endereço de entrega, itens/descrição do pedido, observações,
                    e preferências de personalização.
                  </li>
                  <li>
                    <strong>Conteúdos enviados para personalização:</strong> fotos, referências e informações
                    que você nos encaminha para criarmos a peça.
                  </li>
                </Ul>

                <SubHeading>b) Dados coletados automaticamente</SubHeading>
                <Ul>
                  <li><strong>Dados técnicos:</strong> IP, tipo de dispositivo/navegador, páginas visitadas, data/hora e logs.</li>
                  <li>
                    <strong>Cookies e tecnologias semelhantes:</strong> para funcionamento do site, métricas e/ou publicidade.
                  </li>
                </Ul>
              </InnerSection>

              {/* 3. Para que usamos */}
              <InnerSection>
                <SectionHeading>3) Para que usamos seus dados</SectionHeading>
                <Ul>
                  <li><strong>Atender e responder</strong> seus contatos e pedidos.</li>
                  <li><strong>Processar compras</strong>, pagamentos, emissão de comprovantes e prevenção de fraudes.</li>
                  <li><strong>Produzir e entregar</strong> seu pedido (logística e comunicação sobre o andamento).</li>
                  <li><strong>Personalização</strong> (com base no que você enviar e solicitar).</li>
                  <li><strong>Melhorar o site</strong> (métricas e desempenho, quando habilitadas).</li>
                  <li><strong>Marketing</strong> (ex.: remarketing/anúncios) apenas se você usar essas ferramentas e, quando aplicável, com consentimento.</li>
                </Ul>
                <P>
                  Boas práticas de transparência exigem que essas finalidades sejam claras.
                </P>
              </InnerSection>

              {/* 4. Base legal */}
              <InnerSection>
                <SectionHeading>4) Bases legais</SectionHeading>
                <P>
                  Dependendo do contexto e da legislação aplicável, o tratamento pode ocorrer com base em:
                  (i) execução de contrato/medidas pré-contratuais (para produzir e entregar seu pedido),
                  (ii) cumprimento de obrigações legais, (iii) legítimo interesse (ex.: segurança e melhoria do serviço),
                  e/ou (iv) consentimento (ex.: cookies de marketing, quando aplicável).
                </P>
              </InnerSection>

              {/* 5. Compartilhamento */}
              <InnerSection>
                <SectionHeading>5) Com quem compartilhamos</SectionHeading>
                <P>Compartilhamos dados apenas quando necessário para operar o serviço, por exemplo:</P>
                <Ul>
                  <li><strong>Pagamentos:</strong> {paymentProvider}</li>
                  <li><strong>Hospedagem/infra:</strong> {hostingProvider}</li>
                  <li><strong>Métricas/ads (se usados):</strong> {analyticsTools}</li>
                  <li><strong>Envio/entrega:</strong> {shippingProviders}</li>
                  <li><strong>E-mails/CRM (se usado):</strong> {crmEmailTool}</li>
                </Ul>
                <P>
                  Também podemos compartilhar se exigido por lei, ordem judicial/autoridade competente,
                  ou para proteger direitos e prevenir fraudes.
                </P>
              </InnerSection>

              {/* 6. Transferências internacionais */}
              <InnerSection>
                <SectionHeading>6) Transferências internacionais</SectionHeading>
                <P>
                  Dependendo dos provedores usados (pagamento, hospedagem, analytics), seus dados podem ser
                  processados em outros países. Quando isso ocorrer, adotamos medidas razoáveis para garantir
                  proteção adequada e transparência sobre esse compartilhamento. 
                </P>
              </InnerSection>

              {/* 7. Retenção */}
              <InnerSection>
                <SectionHeading>7) Por quanto tempo guardamos</SectionHeading>
                <P>
                  Mantemos os dados apenas pelo tempo necessário para cumprir as finalidades desta Política,
                  incluindo obrigações legais, resolução de disputas, auditorias e segurança. Onde possível,
                  usamos critérios como: duração do relacionamento, prazos legais aplicáveis e necessidade operacional. 
                </P>
              </InnerSection>

              {/* 8. Cookies */}
              <InnerSection>
                <SectionHeading>8) Cookies e preferências</SectionHeading>
                <P>
                  Usamos cookies essenciais para funcionamento do site. Cookies de desempenho/marketing só
                  são utilizados se você habilitar ferramentas de métricas/ads e, quando aplicável, após consentimento.
                </P>
              </InnerSection>

              {/* 9. Segurança */}
              <InnerSection>
                <SectionHeading>9) Segurança</SectionHeading>
                <P>
                  Adotamos medidas técnicas e organizacionais para proteger os dados contra acesso não autorizado,
                  perda, alteração ou divulgação indevida (ex.: controle de acesso, boas práticas de hospedagem e criptografia em trânsito/HTTPS).
                  Nenhum sistema é 100% seguro, mas buscamos continuamente reduzir riscos.
                </P>
              </InnerSection>

              {/* 10. Seus direitos */}
              <InnerSection>
                <SectionHeading>10) Seus direitos</SectionHeading>
                <P>
                  Você pode solicitar, conforme aplicável, acesso, correção, atualização, portabilidade,
                  eliminação/anonimização, informação sobre compartilhamento e revisão de decisões automatizadas
                  (quando existirem). Também pode se opor a determinados tratamentos e retirar consentimento quando essa for a base. 
                </P>

                <P>
                  Para exercer seus direitos, entre em contato pelo e-mail{" "}<strong>{contactEmail || "informado na página de contato"}</strong>.
                  Podemos solicitar informações adicionais para confirmar sua identidade e proteger seus dados.
                </P>
              </InnerSection>

              {/* 11. Crianças */}
              <InnerSection>
                <SectionHeading>11) Dados de crianças e adolescentes</SectionHeading>
                <P>
                  Nosso site/serviço não é direcionado a crianças. Caso você acredite que uma criança nos enviou
                  dados pessoais sem supervisão adequada, entre em contato para analisarmos e, quando cabível, removermos.
                </P>
              </InnerSection>

              {/* 12. Conteúdo enviado (fotos) */}
              <InnerSection>
                <SectionHeading>12) Fotos e referências para personalização</SectionHeading>
                <P>
                  Se você nos envia imagens e referências (por exemplo, fotos para inspirar a criação da peça),
                  usamos esse material apenas para atender seu pedido e comunicação relacionada. Se quisermos usar
                  imagens do seu pedido para portfólio/redes sociais, pediremos autorização separadamente (ou você
                  poderá optar por não autorizar).
                </P>
              </InnerSection>

              {/* 13. Alterações */}
              <InnerSection>
                <SectionHeading>13) Mudanças nesta Política</SectionHeading>
                <P>
                  Podemos atualizar esta Política para refletir melhorias, mudanças legais ou operacionais.
                  Publicaremos a versão atualizada nesta página, com a data de revisão.
                </P>
              </InnerSection>

              {/* 14. Contato */}
              <InnerSection>
                <SectionHeading>14) Contato</SectionHeading>
                <P>
                  Dúvidas sobre privacidade e dados pessoais? Fale com a gente.
                </P>

                <div className="pt-2">
                  <Button href="/contato">
                    Ir para Contato
                  </Button>
                </div>
              </InnerSection>
            </div>
          </div>
        </main>
      </Container>
    </div>
  );
}