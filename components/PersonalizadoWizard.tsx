"use client";

import {
  useMemo,
  useState,
} from "react";

type PedidoTipo =
  | "Enfeite para chimarrão"
  | "Lembrancinhas"
  | "Topo de bolo"
  | "Miniatura/personagem"
  | "Outro";

const PEDIDO_TIPOS: PedidoTipo[] = [
  "Enfeite para chimarrão",
  "Lembrancinhas",
  "Topo de bolo",
  "Miniatura/personagem",
  "Outro",
];

const baseInput =
  "w-full rounded-2xl border border-[var(--rose-100)] bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[var(--green-300)] focus:ring-2 focus:ring-[var(--green-300)]/30";

function StepHeader({
  step,
  total,
  title,
}: {
  step: number;
  total: number;
  title: string;
}) {
  const progress =
    (step / total) * 100;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <span>
            Passo {step} de {total}
          </span>

          <span>
            {Math.round(progress)}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--rose-100)]">
          <div
            className="h-full rounded-full bg-[var(--green-500)] transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className="text-sm font-semibold text-zinc-900"
      htmlFor={htmlFor}
    >
      {children}
    </label>
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
        "rounded-2xl border px-4 py-2.5 text-sm font-semibold transition cursor-pointer",
        active
          ? "border-[var(--green-500)] bg-[var(--green-500)] text-white"
          : "border-[var(--rose-100)] bg-white text-[var(--text-muted)] hover:border-[var(--green-300)] hover:text-zinc-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="grid gap-1 border-b border-[var(--rose-100)] py-3 last:border-b-0 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </dt>

      <dd className="text-sm leading-relaxed text-zinc-900">
        {value}
      </dd>
    </div>
  );
}

function formatDateInput(
  value: string
) {
  const digits =
    value.replace(/\D/g, "");

  const day =
    digits.slice(0, 2);

  const month =
    digits.slice(2, 4);

  const year =
    digits.slice(4, 8);

  if (digits.length <= 2) {
    return day;
  }

  if (digits.length <= 4) {
    return `${day}/${month}`;
  }

  return `${day}/${month}/${year}`;
}

export default function PersonalizadoWizard({
  whatsappBaseUrl,
}: {
  whatsappBaseUrl: string;
}) {
  const totalSteps = 4;

  const [step, setStep] =
    useState(1);

  const [tipo, setTipo] =
    useState<PedidoTipo>(
      "Enfeite para chimarrão"
    );

  const [quantidade, setQuantidade] =
    useState("1");

  const [tema, setTema] =
    useState("");

  const [cores, setCores] =
    useState("");

  const [
    outrosDetalhes,
    setOutrosDetalhes,
  ] = useState("");

  const [ocasiao, setOcasiao] =
    useState("");

  const [dataEvento, setDataEvento] =
    useState("");

  const [
    cidadeEstado,
    setCidadeEstado,
  ] = useState("");

  const resumo = useMemo(() => {
    const linhas: string[] = [];

    linhas.push(
      "Oi! Quero fazer um pedido personalizado."
    );

    linhas.push("");

    linhas.push(
      `• Tipo: ${tipo}`
    );

    if (quantidade.trim()) {
      linhas.push(
        `• Quantidade: ${quantidade.trim()}`
      );
    }

    if (tema.trim()) {
      linhas.push(
        `• Tema/ideia: ${tema.trim()}`
      );
    }

    if (cores.trim()) {
      linhas.push(
        `• Cores: ${cores.trim()}`
      );
    }

    if (
      outrosDetalhes.trim()
    ) {
      linhas.push("");

      linhas.push(
        "• Detalhes importantes:"
      );

      linhas.push(
        outrosDetalhes.trim()
      );
    }

    if (
      ocasiao.trim() ||
      dataEvento.trim() ||
      cidadeEstado.trim()
    ) {
      linhas.push("");
    }

    if (ocasiao.trim()) {
      linhas.push(
        `• Ocasião: ${ocasiao.trim()}`
      );
    }

    if (dataEvento.trim()) {
      linhas.push(
        `• Data importante: ${dataEvento.trim()}`
      );
    }

    if (
      cidadeEstado.trim()
    ) {
      linhas.push(
        `• Cidade/UF: ${cidadeEstado.trim()}`
      );
    }

    linhas.push("");

    linhas.push(
      "Posso enviar fotos e referências por aqui também."
    );

    return linhas.join("\n");
  }, [
    tipo,
    quantidade,
    tema,
    cores,
    outrosDetalhes,
    ocasiao,
    dataEvento,
    cidadeEstado,
  ]);

  const whatsappLink =
    useMemo(() => {
      if (!whatsappBaseUrl) {
        return "";
      }

      const separator =
        whatsappBaseUrl.includes("?")
          ? "&"
          : "?";

      return `${whatsappBaseUrl}${separator}text=${encodeURIComponent(
        resumo
      )}`;
    }, [
      whatsappBaseUrl,
      resumo,
    ]);

  const canNext =
    useMemo(() => {
      if (step === 1) {
        if (tipo === "Outro") {
          return Boolean(
            tema.trim()
          );
        }

        return Boolean(tipo);
      }

      if (step === 2) {
        return Boolean(
          quantidade.trim()
        );
      }

      return true;
    }, [
      step,
      tipo,
      tema,
      quantidade,
    ]);

  function next() {
    if (!canNext) {
      return;
    }

    setStep((current) =>
      Math.min(
        totalSteps,
        current + 1
      )
    );
  }

  function prev() {
    setStep((current) =>
      Math.max(
        1,
        current - 1
      )
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--rose-100)] bg-white/80 p-5 shadow-sm sm:p-7 lg:p-8">
      <div className="space-y-7">
        {step === 1 && (
          <>
            <StepHeader
              step={1}
              total={totalSteps}
              title="O que você quer criar?"
            />

            <div className="flex flex-wrap gap-2">
              {PEDIDO_TIPOS.map(
                (option) => (
                  <Pill
                    key={option}
                    active={
                      tipo === option
                    }
                    onClick={() =>
                      setTipo(option)
                    }
                  >
                    {option}
                  </Pill>
                )
              )}
            </div>

            {tipo === "Outro" && (
              <div className="grid gap-2">
                <FieldLabel htmlFor="temaOutro">
                  Descreva sua ideia
                </FieldLabel>

                <input
                  id="temaOutro"
                  className={baseInput}
                  value={tema}
                  onChange={(event) =>
                    setTema(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: acessório para cuia, lembrança diferente..."
                />
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader
              step={2}
              total={totalSteps}
              title="Conte sobre a ideia"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel htmlFor="quantidade">
                  Quantidade
                </FieldLabel>

                <input
                  id="quantidade"
                  className={baseInput}
                  value={quantidade}
                  onChange={(event) =>
                    setQuantidade(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: 1, 10, 50..."
                  inputMode="numeric"
                />
              </div>

              {tipo !== "Outro" && (
                <div className="grid gap-2">
                  <FieldLabel htmlFor="tema">
                    Tema / ideia
                  </FieldLabel>

                  <input
                    id="tema"
                    className={baseInput}
                    value={tema}
                    onChange={(event) =>
                      setTema(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: floral, gaúcho, personagem..."
                  />
                </div>
              )}

              <div className="grid gap-2 sm:col-span-2">
                <FieldLabel htmlFor="cores">
                  Cores{" "}
                  <span className="font-normal text-[var(--text-muted)]">
                    (opcional)
                  </span>
                </FieldLabel>

                <input
                  id="cores"
                  className={baseInput}
                  value={cores}
                  onChange={(event) =>
                    setCores(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: verde e bege, tons pastéis..."
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <FieldLabel htmlFor="detalhes">
                  Detalhes importantes{" "}
                  <span className="font-normal text-[var(--text-muted)]">
                    (opcional)
                  </span>
                </FieldLabel>

                <textarea
                  id="detalhes"
                  className={baseInput}
                  rows={5}
                  value={
                    outrosDetalhes
                  }
                  onChange={(event) =>
                    setOutrosDetalhes(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: nome na peça, cabelo castanho, olhos verdes, roupa, acessórios, frase ou alguma referência importante..."
                />

                <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                  Se houver uma pessoa,
                  personagem ou detalhe
                  específico, pode explicar
                  tudo aqui.
                </p>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader
              step={3}
              total={totalSteps}
              title="Data e entrega"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <FieldLabel htmlFor="ocasiao">
                  Ocasião{" "}
                  <span className="font-normal text-[var(--text-muted)]">
                    (opcional)
                  </span>
                </FieldLabel>

                <input
                  id="ocasiao"
                  className={baseInput}
                  value={ocasiao}
                  onChange={(event) =>
                    setOcasiao(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: aniversário, casamento, presente..."
                />
              </div>

              <div className="grid gap-2">
                <FieldLabel htmlFor="dataEvento">
                  Data importante{" "}
                  <span className="font-normal text-[var(--text-muted)]">
                    (opcional)
                  </span>
                </FieldLabel>

                <input
                  id="dataEvento"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  className={baseInput}
                  value={dataEvento}
                  onChange={(event) =>
                    setDataEvento(
                      formatDateInput(
                        event.target.value
                      )
                    )
                  }
                  placeholder="dd/mm/aaaa"
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <FieldLabel htmlFor="cidadeEstado">
                  Cidade/UF{" "}
                  <span className="font-normal text-[var(--text-muted)]">
                    (opcional)
                  </span>
                </FieldLabel>

                <input
                  id="cidadeEstado"
                  className={baseInput}
                  value={
                    cidadeEstado
                  }
                  onChange={(event) =>
                    setCidadeEstado(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Porto Alegre/RS"
                />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Se você precisa da peça para
              uma data específica, informe
              acima para verificarmos a
              disponibilidade.
            </p>
          </>
        )}

        {step === 4 && (
          <>
            <StepHeader
              step={4}
              total={totalSteps}
              title="Confira e envie"
            />

            <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-50)]/60 px-5 py-2">
              <dl>
                <SummaryItem
                  label="Tipo"
                  value={tipo}
                />

                <SummaryItem
                  label="Quantidade"
                  value={quantidade}
                />

                <SummaryItem
                  label="Tema / ideia"
                  value={tema}
                />

                <SummaryItem
                  label="Cores"
                  value={cores}
                />

                <SummaryItem
                  label="Detalhes"
                  value={
                    outrosDetalhes
                  }
                />

                <SummaryItem
                  label="Ocasião"
                  value={ocasiao}
                />

                <SummaryItem
                  label="Data"
                  value={dataEvento}
                />

                <SummaryItem
                  label="Cidade/UF"
                  value={
                    cidadeEstado
                  }
                />
              </dl>
            </div>

            <div className="space-y-3">
              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--green-500)] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--green-300)]"
                >
                  Enviar pedido pelo WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-2xl bg-[var(--green-500)] px-5 py-3.5 text-sm font-semibold text-white opacity-50"
                >
                  WhatsApp indisponível
                </button>
              )}

              <p className="text-center text-xs leading-relaxed text-[var(--text-muted)]">
                Depois de enviar, você pode
                anexar fotos e referências
                diretamente na conversa.
              </p>
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-[var(--rose-100)] pt-5">
          <button
            type="button"
            onClick={prev}
            disabled={step === 1}
            className={[
              "rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ",
              step === 1
                ? "cursor-not-allowed border-[var(--rose-100)] bg-white/40 text-[var(--text-muted)] opacity-50"
                : "border-[var(--rose-100)] bg-white text-zinc-900 hover:bg-[var(--rose-50)] cursor-pointer",
            ].join(" ")}
          >
            Voltar
          </button>

          {step < totalSteps && (
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className={[
                "rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition ",
                canNext
                  ? "bg-[var(--green-500)] hover:bg-[var(--green-300)] cursor-pointer"
                  : "cursor-not-allowed bg-[var(--green-500)] opacity-50",
              ].join(" ")}
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}