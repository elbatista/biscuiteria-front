import Container from "../Container";
import Section from "../Section";
import Button from "../Button";
import Badge from "../Badge";

export default function FinalCta() {
  return (
    <Section color="rose">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[var(--rose-100)] bg-white shadow-sm">
          <div className="relative px-6 py-10 sm:px-10 sm:py-14">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--rose-100)]/70" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[var(--green-50)]" />

            <div className="relative mx-auto max-w-3xl text-center">

              <h2 className="mt-4 font-playfair text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                Encontre uma peça especial ou crie algo só seu
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                Veja as peças disponíveis, explore as coleções ou envie sua ideia
                para transformar um momento em uma lembrança artesanal.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href="/loja">Ver peças prontas</Button>
                <Button href="/personalizados" variant="secondary">
                  Criar personalizado
                </Button>
              </div>

              <p className="mt-5 text-xs text-[var(--text-muted)]">
                Feito à mão, com cuidado, intenção e acabamento especial.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}