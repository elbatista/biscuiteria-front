"use client";

import { useMemo, useState } from "react";

type PedidoTipo =
  | "Enfeite para chimarrão"
  | "Lembrancinhas"
  | "Topo de bolo"
  | "Miniatura/personagem"
  | "Outro";

const baseInput =
  "w-full rounded-2xl border border-[var(--rose-100)] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--green-300)]";

function StepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-[var(--text-muted)]">
        Passo {step} de {total}
      </div>
      <div className="text-zinc-900 font-semibold">{title}</div>
      {subtitle ? (
        <div className="text-sm text-[var(--text-muted)]">{subtitle}</div>
      ) : null}
    </div>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-zinc-900" htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--rose-100)] bg-white/70 p-6 shadow-sm">
      {children}
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-2 text-sm font-semibold border transition cursor-pointer",
        active
          ? "bg-[var(--green-500)] text-white border-[var(--green-500)] "
          : "bg-white/70 text-[var(--text-muted)] border-[var(--rose-100)] hover:bg-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function PersonalizadoWizard() {
  const totalSteps = 5;
  const [step, setStep] = useState(1);

  // Dados do pedido
  const [tipo, setTipo] = useState<PedidoTipo>("Enfeite para chimarrão");
  const [ocasiao, setOcasiao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [quantidade, setQuantidade] = useState<string>("1");
  const [tema, setTema] = useState("");
  const [cores, setCores] = useState("");

  // Detalhes que a Adi mencionou (cabelo/olhos etc.)
  const [temPessoa, setTemPessoa] = useState<"sim" | "nao">("nao");
  const [cabelo, setCabelo] = useState("");
  const [olhos, setOlhos] = useState("");
  const [outrosDetalhes, setOutrosDetalhes] = useState("");

  // Logística/contato
  const [prazoDesejado, setPrazoDesejado] = useState("");
  const [cidadeEstado, setCidadeEstado] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  // WhatsApp (preencha depois com seu link real)
  const WHATSAPP_BASE = process.env.NEXT_PUBLIC_WHATSAPP_URL;

  const resumo = useMemo(() => {
    const linhas: string[] = [];
    linhas.push("Oi! Quero um pedido personalizado.");
    linhas.push("");
    linhas.push(`• Tipo: ${tipo}`);
    if (ocasiao) linhas.push(`• Ocasião: ${ocasiao}`);
    if (dataEvento) linhas.push(`• Data do evento: ${dataEvento}`);
    if (quantidade) linhas.push(`• Quantidade: ${quantidade}`);
    if (tema) linhas.push(`• Tema/ideia: ${tema}`);
    if (cores) linhas.push(`• Cores: ${cores}`);
    linhas.push("");
    if (temPessoa === "sim") {
      linhas.push("• Detalhes (pessoa/personagem):");
      if (cabelo) linhas.push(`  - Cabelo: ${cabelo}`);
      if (olhos) linhas.push(`  - Olhos: ${olhos}`);
    }
    if (outrosDetalhes) {
      linhas.push("");
      linhas.push("• Outros detalhes:");
      linhas.push(outrosDetalhes);
    }
    linhas.push("");
    if (prazoDesejado) linhas.push(`• Prazo desejado: ${prazoDesejado}`);
    if (cidadeEstado) linhas.push(`• Cidade/UF para envio: ${cidadeEstado}`);
    if (nome) linhas.push(`• Nome: ${nome}`);
    if (telefone) linhas.push(`• Telefone/WhatsApp: ${telefone}`);
    linhas.push("");
    linhas.push("Vou enviar fotos/vídeos por aqui no WhatsApp (se precisar).");
    return linhas.join("\n");
  }, [
    tipo,
    ocasiao,
    dataEvento,
    quantidade,
    tema,
    cores,
    temPessoa,
    cabelo,
    olhos,
    outrosDetalhes,
    prazoDesejado,
    cidadeEstado,
    nome,
    telefone,
  ]);

  const whatsappLink = useMemo(() => {
    const text = encodeURIComponent(resumo);
    return `${WHATSAPP_BASE}?text=${text}`;
  }, [resumo]);

  const canNext = useMemo(() => {
    // Regras simples por passo (guiado, mas sem travar demais)
    if (step === 1) return Boolean(tipo);
    if (step === 2) return Boolean(quantidade) && Boolean(tema || ocasiao || tipo);
    if (step === 3) return true;
    if (step === 4) return true;
    if (step === 5) return true;
    return true;
  }, [step, tipo, quantidade, tema, ocasiao]);

  function next() {
    if (!canNext) return;
    setStep((s) => Math.min(totalSteps, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Wizard */}
      <Card>
        <div className="space-y-6">
          {step === 1 && (
            <>
              <StepHeader
                step={1}
                total={totalSteps}
                title="Qual tipo de personalizado você quer?"
                subtitle="Escolha a categoria principal. Isso define as perguntas seguintes."
              />

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "Enfeite para chimarrão",
                    "Lembrancinhas",
                    "Topo de bolo",
                    "Miniatura/personagem",
                    "Outro",
                  ] as PedidoTipo[]
                ).map((t) => (
                  <Pill key={t} active={tipo === t} onClick={() => setTipo(t)}>
                    {t}
                  </Pill>
                ))}
              </div>

              {tipo === "Outro" ? (
                <div className="grid gap-2">
                  <FieldLabel htmlFor="tema_outro">Descreva o que você tem em mente</FieldLabel>
                  <input
                    id="tema_outro"
                    className={baseInput}
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ex.: enfeite para cuia com tema X / acessório específico / algo diferente…"
                  />
                </div>
              ) : null}
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader
                step={2}
                total={totalSteps}
                title="Sobre a ocasião e o básico do pedido"
                subtitle="Datas especiais? Quantidade? O que é essencial para começar."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <FieldLabel htmlFor="ocasiao">Ocasião (opcional)</FieldLabel>
                  <input
                    id="ocasiao"
                    className={baseInput}
                    value={ocasiao}
                    onChange={(e) => setOcasiao(e.target.value)}
                    placeholder="Ex.: aniversário, casamento, batizado, presente…"
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="dataEvento">Data do evento (opcional)</FieldLabel>
                  <input
                    id="dataEvento"
                    className={baseInput}
                    value={dataEvento}
                    onChange={(e) => setDataEvento(e.target.value)}
                    placeholder="Ex.: 10/03/2026"
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="quantidade">Quantidade</FieldLabel>
                  <input
                    id="quantidade"
                    className={baseInput}
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="Ex.: 1, 10, 50…"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="tema">Tema / ideia principal</FieldLabel>
                  <input
                    id="tema"
                    className={baseInput}
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ex.: tema fazendinha / chimarrão gaúcho / floral / personagem…"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <FieldLabel htmlFor="cores">Cores (opcional)</FieldLabel>
                <input
                  id="cores"
                  className={baseInput}
                  value={cores}
                  onChange={(e) => setCores(e.target.value)}
                  placeholder="Ex.: verde, bege, marrom / tons pastéis / dourado…"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader
                step={3}
                total={totalSteps}
                title="Vai ter pessoa/personagem? (cabelo/olhos)"
                subtitle="Para enfeites simples, às vezes só isso já resolve bem."
              />

              <div className="flex gap-2">
                <Pill active={temPessoa === "nao"} onClick={() => setTemPessoa("nao")}>
                  Não
                </Pill>
                <Pill active={temPessoa === "sim"} onClick={() => setTemPessoa("sim")}>
                  Sim
                </Pill>
              </div>

              {temPessoa === "sim" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="cabelo">Cor/estilo do cabelo</FieldLabel>
                    <input
                      id="cabelo"
                      className={baseInput}
                      value={cabelo}
                      onChange={(e) => setCabelo(e.target.value)}
                      placeholder="Ex.: castanho escuro cacheado / loiro curto…"
                    />
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel htmlFor="olhos">Cor dos olhos</FieldLabel>
                    <input
                      id="olhos"
                      className={baseInput}
                      value={olhos}
                      onChange={(e) => setOlhos(e.target.value)}
                      placeholder="Ex.: castanho / azul / verde…"
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                <FieldLabel htmlFor="outros">Outros detalhes (opcional)</FieldLabel>
                <textarea
                  id="outros"
                  className={baseInput}
                  rows={5}
                  value={outrosDetalhes}
                  onChange={(e) => setOutrosDetalhes(e.target.value)}
                  placeholder="Ex.: nome na peça, frase curtinha, roupa/cor, acessórios, formato do enfeite, tamanho aproximado…"
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <StepHeader
                step={4}
                total={totalSteps}
                title="Prazo, envio e como você prefere contato"
                subtitle="Isso ajuda a confirmar viabilidade e orientar valor/prazo."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <FieldLabel htmlFor="prazo">Prazo desejado (opcional)</FieldLabel>
                  <input
                    id="prazo"
                    className={baseInput}
                    value={prazoDesejado}
                    onChange={(e) => setPrazoDesejado(e.target.value)}
                    placeholder="Ex.: preciso até 20/03 / sem pressa…"
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="cidade">Cidade/UF para envio (opcional)</FieldLabel>
                  <input
                    id="cidade"
                    className={baseInput}
                    value={cidadeEstado}
                    onChange={(e) => setCidadeEstado(e.target.value)}
                    placeholder="Ex.: Porto Alegre/RS"
                  />
                </div>

                <div className="grid gap-2">
                  <FieldLabel htmlFor="nome">Seu nome (opcional)</FieldLabel>
                  <input
                    id="nome"
                    className={baseInput}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex.: Ana"
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <FieldLabel htmlFor="tel">Telefone/WhatsApp (opcional)</FieldLabel>
                  <input
                    id="tel"
                    className={baseInput}
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex.: (51) 9xxxx-xxxx"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-5">
                <div className="text-sm text-[var(--text-muted)] leading-relaxed">
                  <strong className="text-zinc-900">Fotos e vídeos:</strong> no próximo passo você terá um botão
                  para enviar tudo pelo WhatsApp (e anexar as mídias por lá).
                </div>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <StepHeader
                step={5}
                total={totalSteps}
                title="Pronto! Confira e envie pelo WhatsApp"
                subtitle="Copie se quiser, ou clique para enviar. Depois, mande fotos/vídeos por lá."
              />

              <div className="grid gap-2">
                <FieldLabel htmlFor="resumo">Resumo do pedido</FieldLabel>
                <textarea id="resumo" className={baseInput} rows={14} value={resumo} readOnly />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition bg-[var(--green-500)] text-white hover:bg-[var(--green-300)] shadow-sm"
                >
                  Enviar no WhatsApp
                </a>

                <a
                  href="/contato"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition bg-[var(--rose-100)] text-[var(--rose-500)] hover:bg-[var(--rose-300)] border border-[var(--rose-300)]"
                >
                  Prefiro falar direto
                </a>
              </div>

              <p className="text-xs text-[var(--text-muted)]">
                Depois de enviar, você pode anexar fotos e vídeos no WhatsApp. Se tiver data especial, mande a data logo no início.
              </p>
            </>
          )}

          {/* Nav */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className={[
                "rounded-2xl px-4 py-2 text-sm font-semibold border transition",
                step === 1
                  ? "bg-white/40 text-[var(--text-muted)] border-[var(--rose-100)] opacity-60 cursor-not-allowed"
                  : "bg-white/70 text-zinc-900 border-[var(--rose-100)] hover:bg-white cursor-pointer",
              ].join(" ")}
            >
              Voltar
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!canNext || step === totalSteps}
              className={[
                "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                !canNext || step === totalSteps
                  ? "bg-[var(--green-500)] text-white opacity-60 cursor-not-allowed"
                  : "bg-[var(--green-500)] text-white hover:bg-[var(--green-300)] cursor-pointer",
              ].join(" ")}
            >
              {step === totalSteps ? "Concluído" : "Continuar"}
            </button>
          </div>

          {/* mini disclaimer */}
          <p className="text-xs text-[var(--text-muted)] pt-2">
            *Este formulário não envia arquivos. Para fotos/vídeos, use o botão do WhatsApp no final.
          </p>
        </div>
      </Card>

      {/* Sidebar: dicas + “ansiedade boa” */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-5">
          <div className="text-sm font-semibold text-zinc-900">Para ficar perfeito</div>
          <ul className="mt-2 list-disc pl-5 space-y-2 text-sm text-[var(--text-muted)]">
            <li>Se for para data especial, informe a data e a quantidade.</li>
            <li>Para enfeites simples, cabelo/olhos e cores já ajudam muito.</li>
            <li>Fotos e referências você envia pelo WhatsApp no final.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-100)] p-5">
          <div className="text-sm font-semibold text-zinc-900">Agenda & lotes</div>
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
            Como é tudo artesanal, eu consigo pegar um número limitado de pedidos por período.
            Se você tem uma data importante, vale mandar o pedido com antecedência 🧉✨
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--rose-100)] bg-white/60 p-5">
          <div className="text-sm font-semibold text-zinc-900">Precisa de algo diferente?</div>
          <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
            Sem problema — escolha “Outro” no início e descreva a ideia. A gente ajusta juntos.
          </p>
        </div>
      </div>
    </div>
  );
}