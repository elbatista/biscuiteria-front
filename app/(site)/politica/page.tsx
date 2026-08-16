import Container from "@/components/Container";
import Badge from "@/components/Badge";
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
  title: "Política de Privacidade | Biscuit_eria",
  description:
    "Saiba como a Biscuit_eria coleta, usa e protege seus dados pessoais, e como você pode exercer seus direitos.",
};

export default function PoliticaDePrivacidadePage() {
  const lastUpdated = "Agosto de 2026";

  const brand = "Biscuit_eria";

  const controllerName =
    process.env.NEXT_PUBLIC_RAZAO_SOCIAL ||
    brand;

  const controllerAddress =
    "São Leopoldo, RS, Brasil";

  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  const whatsappHref =
    process.env.NEXT_PUBLIC_WHATSAPP_URL;

  /**
   * Serviços atualmente utilizados pelo site.
   */
  const paymentProcess =
    "o pagamento é combinado diretamente após o envio do pedido";

  const analyticsTools =
    "Vercel Analytics";

  const hostingProvider =
    "Vercel";

  const databaseProvider =
    "Supabase";

  const imageStorageProvider =
    "Vercel Blob";

  const shippingProcess =
    "modalidade de entrega definida conforme cada pedido";

  const emailProvider =
    "Resend";

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <main className="py-14 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <Badge>
              Política de Privacidade
            </Badge>

            <h1 className="font-playfair text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Como cuidamos dos seus dados
            </h1>

            <P>
              Esta Política de Privacidade explica como a{" "}
              <strong>{brand}</strong> coleta,
              utiliza, armazena, compartilha e protege
              dados pessoais quando você visita nosso
              site, entra em contato, faz um pedido ou
              solicita uma personalização. Ela também
              descreve seus direitos e como exercê-los.
            </P>

            <LastUpdate>
              {lastUpdated}
            </LastUpdate>

            <div className="space-y-10 pt-6">
              {/* 1. Quem somos */}
              <InnerSection>
                <SectionHeading>
                  1) Quem é o responsável pelo tratamento
                </SectionHeading>

                <P>
                  <strong>
                    Controladora:
                  </strong>{" "}
                  {controllerName}
                  <br />

                  <strong>
                    Local:
                  </strong>{" "}
                  {controllerAddress}
                  <br />

                  <strong>
                    E-mail:
                  </strong>{" "}
                  {contactEmail ||
                    "disponível na página de contato"}
                  <br />

                  <FalarWhats
                    href={
                      whatsappHref
                    }
                  />
                </P>
              </InnerSection>

              {/* 2. Dados coletados */}
              <InnerSection>
                <SectionHeading>
                  2) Quais dados pessoais coletamos
                </SectionHeading>

                <SubHeading>
                  a) Dados que você fornece
                </SubHeading>

                <Ul>
                  <li>
                    <strong>
                      Contato:
                    </strong>{" "}
                    nome, e-mail,
                    telefone/WhatsApp e
                    informações enviadas
                    pelos nossos canais de
                    atendimento.
                  </li>

                  <li>
                    <strong>
                      Pedido:
                    </strong>{" "}
                    nome do cliente e do
                    destinatário, e-mail,
                    telefone, endereço de
                    entrega, itens do
                    pedido, observações e
                    informações necessárias
                    para produção e entrega.
                  </li>

                  <li>
                    <strong>
                      Personalização:
                    </strong>{" "}
                    preferências, cores,
                    referências, imagens,
                    textos ou outras
                    informações fornecidas
                    para criação da peça.
                  </li>
                </Ul>

                <SubHeading>
                  b) Dados coletados durante o uso do site
                </SubHeading>

                <Ul>
                  <li>
                    <strong>
                      Dados técnicos:
                    </strong>{" "}
                    informações como IP,
                    navegador, dispositivo,
                    páginas acessadas,
                    data/hora e registros
                    técnicos necessários
                    para segurança e
                    funcionamento do site.
                  </li>

                  <li>
                    <strong>
                      Métricas de uso:
                    </strong>{" "}
                    podemos utilizar
                    ferramentas de análise
                    para entender o
                    desempenho e a
                    utilização do site.
                  </li>
                </Ul>
              </InnerSection>

              {/* 3. Finalidades */}
              <InnerSection>
                <SectionHeading>
                  3) Para que usamos seus dados
                </SectionHeading>

                <Ul>
                  <li>
                    <strong>
                      Receber e administrar pedidos
                    </strong>
                    , incluindo cálculo manual de
                    frete, confirmação de pagamento,
                    produção, envio e rastreamento.
                  </li>

                  <li>
                    <strong>
                      Entrar em contato
                    </strong>{" "}
                    sobre pedidos,
                    personalizações, dúvidas
                    e atendimento.
                  </li>

                  <li>
                    <strong>
                      Produzir e entregar
                    </strong>{" "}
                    os produtos solicitados,
                    inclusive utilizando o
                    endereço informado para
                    entrega.
                  </li>

                  <li>
                    <strong>
                      Enviar comunicações transacionais
                    </strong>{" "}
                    relacionadas ao andamento
                    do pedido.
                  </li>

                  <li>
                    <strong>
                      Personalizar produtos
                    </strong>{" "}
                    conforme referências e
                    informações fornecidas
                    pelo cliente.
                  </li>

                  <li>
                    <strong>
                      Manter a segurança
                    </strong>{" "}
                    e prevenir abuso, fraude
                    ou utilização indevida
                    do site.
                  </li>

                  <li>
                    <strong>
                      Melhorar o site
                    </strong>{" "}
                    por meio de métricas de
                    utilização e desempenho,
                    quando disponíveis.
                  </li>
                </Ul>
              </InnerSection>

              {/* 4. Bases legais */}
              <InnerSection>
                <SectionHeading>
                  4) Bases legais
                </SectionHeading>

                <P>
                  Dependendo da situação, o tratamento
                  de dados pessoais poderá ocorrer,
                  entre outras hipóteses previstas na
                  legislação aplicável, para execução
                  de contrato ou de procedimentos
                  preliminares relacionados ao pedido,
                  cumprimento de obrigações legais ou
                  regulatórias, exercício regular de
                  direitos, atendimento a interesses
                  legítimos relacionados à operação e
                  segurança do serviço ou mediante
                  consentimento quando essa for a base
                  aplicável.
                </P>
              </InnerSection>

              {/* 5. Compartilhamento */}
              <InnerSection>
                <SectionHeading>
                  5) Com quem podemos compartilhar dados
                </SectionHeading>

                <P>
                  Utilizamos prestadores de serviço
                  necessários para operar o site e
                  atender os pedidos. Isso pode
                  envolver:
                </P>

                <Ul>
                  <li>
                    <strong>
                      Pagamento:
                    </strong>{" "}
                    {paymentProcess}. Dados
                    necessários ao pagamento
                    também poderão ser
                    tratados pela instituição
                    financeira ou meio de
                    pagamento utilizado pelo
                    cliente.
                  </li>

                  <li>
                    <strong>
                      Hospedagem e aplicação:
                    </strong>{" "}
                    {hostingProvider}.
                  </li>

                  <li>
                    <strong>
                      Banco de dados:
                    </strong>{" "}
                    {databaseProvider}.
                  </li>

                  <li>
                    <strong>
                      Armazenamento de imagens:
                    </strong>{" "}
                    {imageStorageProvider}.
                  </li>

                  <li>
                    <strong>
                      Métricas:
                    </strong>{" "}
                    {analyticsTools}.
                  </li>

                  <li>
                    <strong>
                      E-mails transacionais:
                    </strong>{" "}
                    {emailProvider}.
                  </li>

                  <li>
                    <strong>
                      Envio e entrega:
                    </strong>{" "}
                    {shippingProcess}. Quando
                    necessário, dados como
                    nome, endereço e telefone
                    poderão ser fornecidos ao
                    prestador responsável pela
                    entrega.
                  </li>
                </Ul>

                <P>
                  Também poderemos compartilhar dados
                  quando necessário para cumprimento
                  de obrigação legal ou regulatória,
                  atendimento a determinação de
                  autoridade competente, exercício
                  regular de direitos ou prevenção de
                  fraude e proteção da operação.
                </P>
              </InnerSection>

              {/* 6. Transferência internacional */}
              <InnerSection>
                <SectionHeading>
                  6) Processamento e transferências internacionais
                </SectionHeading>

                <P>
                  Alguns dos prestadores de tecnologia
                  utilizados pelo site podem armazenar
                  ou processar informações em
                  infraestrutura localizada fora do
                  Brasil. Quando aplicável, buscamos
                  utilizar fornecedores que adotem
                  medidas adequadas de segurança e
                  proteção de dados e observamos os
                  requisitos da legislação aplicável.
                </P>
              </InnerSection>

              {/* 7. Retenção */}
              <InnerSection>
                <SectionHeading>
                  7) Por quanto tempo guardamos os dados
                </SectionHeading>

                <P>
                  Mantemos dados pessoais pelo período
                  necessário para atender as
                  finalidades descritas nesta Política
                  e para cumprir obrigações legais,
                  fiscais, regulatórias, contratuais,
                  exercer direitos, prevenir fraudes e
                  solucionar eventuais disputas.
                </P>

                <P>
                  Quando os dados deixarem de ser
                  necessários e não houver fundamento
                  para sua conservação, poderão ser
                  eliminados ou anonimizados, conforme
                  aplicável.
                </P>
              </InnerSection>

              {/* 8. Cookies e métricas */}
              <InnerSection>
                <SectionHeading>
                  8) Cookies, armazenamento local e métricas
                </SectionHeading>

                <P>
                  O site pode utilizar tecnologias
                  necessárias para manter seu
                  funcionamento, preferências,
                  segurança e experiência de
                  navegação. Também utilizamos
                  ferramentas de métricas para avaliar
                  desempenho e utilização do site.
                </P>

                <P>
                  Caso futuramente sejam adicionadas
                  tecnologias que dependam de
                  consentimento, como determinadas
                  ferramentas de publicidade ou
                  rastreamento, esta Política e os
                  respectivos mecanismos de
                  preferência deverão ser atualizados.
                </P>
              </InnerSection>

              {/* 9. Segurança */}
              <InnerSection>
                <SectionHeading>
                  9) Segurança
                </SectionHeading>

                <P>
                  Adotamos medidas técnicas e
                  organizacionais destinadas a
                  proteger dados pessoais contra
                  acesso não autorizado, perda,
                  alteração, destruição ou divulgação
                  indevida, incluindo controle de
                  acesso administrativo, utilização
                  de conexões seguras e boas práticas
                  de hospedagem e armazenamento.
                </P>

                <P>
                  Nenhum sistema é completamente
                  imune a riscos, mas buscamos manter
                  medidas proporcionais à natureza das
                  informações tratadas e à operação do
                  site.
                </P>
              </InnerSection>

              {/* 10. Direitos */}
              <InnerSection>
                <SectionHeading>
                  10) Seus direitos
                </SectionHeading>

                <P>
                  Nos termos da legislação aplicável,
                  você poderá solicitar, conforme o
                  caso, confirmação da existência de
                  tratamento, acesso aos dados,
                  correção de informações incompletas
                  ou inexatas, anonimização, bloqueio
                  ou eliminação de dados tratados em
                  desconformidade, portabilidade,
                  informações sobre compartilhamento,
                  eliminação de dados tratados com
                  consentimento quando aplicável e
                  revogação do consentimento.
                </P>

                <P>
                  Você também poderá exercer outros
                  direitos previstos na legislação,
                  inclusive relacionados a tratamentos
                  automatizados quando aplicáveis.
                </P>

                <P>
                  Para exercer seus direitos, entre em
                  contato pelo e-mail{" "}
                  <strong>
                    {contactEmail ||
                      "informado na página de contato"}
                  </strong>
                  . Poderemos solicitar informações
                  adicionais razoavelmente necessárias
                  para confirmar sua identidade e
                  proteger seus dados.
                </P>
              </InnerSection>

              {/* 11. Crianças */}
              <InnerSection>
                <SectionHeading>
                  11) Dados de crianças e adolescentes
                </SectionHeading>

                <P>
                  O site não é direcionado
                  especificamente a crianças. Caso
                  identifiquemos o tratamento de dados
                  de crianças ou adolescentes,
                  adotaremos as providências cabíveis
                  de acordo com a legislação
                  aplicável e com o melhor interesse
                  do titular.
                </P>

                <P>
                  Se você acredita que dados de uma
                  criança foram enviados de forma
                  inadequada, entre em contato para
                  que possamos analisar a situação.
                </P>
              </InnerSection>

              {/* 12. Fotos */}
              <InnerSection>
                <SectionHeading>
                  12) Fotos e referências para personalização
                </SectionHeading>

                <P>
                  Quando você nos envia imagens,
                  referências, nomes, textos ou outras
                  informações para criação de uma
                  peça, utilizamos esse material para
                  atender ao pedido e para as
                  comunicações necessárias durante o
                  processo de produção.
                </P>

                <P>
                  O envio de uma imagem para produção
                  de um pedido não significa
                  autorização automática para
                  publicação em redes sociais,
                  anúncios ou portfólio. Caso
                  desejemos utilizar conteúdo
                  identificável do seu pedido para
                  divulgação, poderemos solicitar
                  autorização específica.
                </P>
              </InnerSection>

              {/* 13. Links externos */}
              <InnerSection>
                <SectionHeading>
                  13) Links e serviços de terceiros
                </SectionHeading>

                <P>
                  O site pode apresentar links para
                  serviços externos, como WhatsApp,
                  Instagram, rastreamento de entregas
                  ou outros prestadores. Ao acessar
                  esses serviços, o tratamento de
                  dados também poderá estar sujeito às
                  políticas próprias desses terceiros.
                </P>
              </InnerSection>

              {/* 14. Alterações */}
              <InnerSection>
                <SectionHeading>
                  14) Mudanças nesta Política
                </SectionHeading>

                <P>
                  Podemos atualizar esta Política para
                  refletir mudanças legais,
                  operacionais ou tecnológicas. A
                  versão vigente será disponibilizada
                  nesta página com a respectiva data
                  de atualização.
                </P>
              </InnerSection>

              {/* 15. Contato */}
              <InnerSection>
                <SectionHeading>
                  15) Contato
                </SectionHeading>

                <P>
                  Se tiver dúvidas sobre privacidade,
                  tratamento de dados pessoais ou
                  quiser exercer algum dos seus
                  direitos, fale com a gente.
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