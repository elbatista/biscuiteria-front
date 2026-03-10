
import Container from "../Container";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import Button from "../Button";
import Image from "next/image";

const steps = [
    {desc: "Modelagem manual e acabamento cuidadoso", key: "modelagem"},
    {desc: "Peças prontas + encomendas sob medida", key: "encomendas"},
    {desc: "Embalagem pensada para presentear", key: "embalagem"},
    {desc: "Entrega com carinho e cuidado", key: "entrega"},
];

const processPhotos = [
  {
    src: "/processo/1.jpeg",
    alt: "Modelagem manual da peça",
  },
  {
    src: "/processo/2.jpeg",
    alt: "Peças prontas e encomendas sob medida",
  },
  {
    src: "/processo/3.jpeg",
    alt: "Embalagem feita com cuidado para presentear",
  },
];


export default function TheProcess() {
    return (
        <Section>
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <SectionTitle
                  eyebrow="O que torna único"
                  title="Cada peça começa do zero. Sempre."
                  subtitle="Nada aqui é produzido por máquinas. Cada detalhe é moldado à mão, pensado para alguém específico — talvez você, talvez quem você ama."/>
                <div className="grid gap-3">
                  {steps.map(step => (
                    <div key={step.key}
                      className="flex items-start gap-3 rounded-3xl border border-[var(--rose-100)] bg-white p-4 shadow-sm">
                      <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[var(--green-500)] text-white text-xs shadow-sm">
                        ✓
                      </div>
                      <p className="text-sm text-zinc-700">{step.desc}</p>
                    </div>
                  ))}
                </div>
                <Button href="/sobre" variant="secondary">Saber mais</Button>
              </div>

              <div className="rounded-[2rem] border border-[var(--rose-100)] bg-white p-6 shadow-sm">
                {/* <div className="aspect-[16/10] w-full rounded-[1.5rem] bg-gradient-to-br from-[var(--rose-100)] via-white to-[var(--green-50)]">
                  <Image 
                    src="/fotos/modelagem.jpeg" 
                    alt="Foto do processo de criação" 
                    width={600} 
                    height={600} 
                    className="object-cover rounded-[1.5rem] w-full h-full" /> 
                </div> */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="relative aspect-[1.91/3] overflow-hidden rounded-[1.5rem] sm:row-span-2">
                    <Image
                      src={processPhotos[0].src}
                      alt={processPhotos[0].alt}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={processPhotos[1].src}
                      alt={processPhotos[1].alt}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={processPhotos[2].src}
                      alt={processPhotos[2].alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <div className="text-sm font-semibold text-zinc-900">
                    E assim nasce uma peça  <span className="ml-2 text-2xl">🪄✨</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Cada criação é uma jornada de cuidado e dedicação, onde cada curva e detalhe são moldados cuidadosamente, resultando em peças únicas que carregam a essência do artesanato.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>
    );
}

