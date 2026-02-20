import Container from "../Container";
import Button from "../Button";
import Section from "../Section";

const Cta = () => {
    return (
        <Section color="green">
          <Container>
            <div className="rounded-[2.25rem] border border-[var(--green-100)] bg-white/70 p-8 shadow-sm backdrop-blur sm:p-10">
              <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
                <div className="lg:col-span-2">
                  <h3 className="font-playfair text-2xl font-semibold tracking-tight text-zinc-900">
                    Tradição que se compartilha: tudo para o seu chimarrão 🧉
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                    Encontre uma peça pronta para encantar — ou crie uma encomenda com a sua história.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                  <Button href="/loja">Ver todas as peças</Button>
                  <Button href="/personalizados" variant="secondary">Criar algo especial</Button>
                </div>
              </div>
            </div>
          </Container>
        </Section>
    );
}

export default Cta