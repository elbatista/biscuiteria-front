
import Container from "../Container";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import Image from "next/image";

const testimonials = [
    { key: "1", photo: "/depo/1.jpeg" },
    { key: "2", photo: "/depo/2.jpeg" },
    { key: "3", photo: "/depo/6.jpeg" },
    { key: "4", photo: "/depo/4.jpeg" },
    { key: "5", photo: "/depo/5.jpeg" },
    { key: "6", photo: "/depo/3.jpeg" },
];

const SocialProof = () => {
    return (
        <Section>
          <Container>
            <div className="space-y-8">
              <SectionTitle eyebrow="Quem já recebeu" title="Peças que já encontraram um lar 💛"/>
              <div className="grid gap-4 lg:grid-cols-3 lg:gap-8 items-stretch">
                {testimonials.map(t => (
                <div className="h-full w-full " key={t.key}>
                    <div className="h-full flex flex-col p-2 rounded-3xl border border-[var(--rose-100)] bg-white shadow-sm hover:shadow-md transition items-center">
                        <Image src={t.photo}
                            alt={t.key}
                            width={400}
                            height={400}
                            className="rounded-3xl object-cover overflow-hidden"/>
                    </div>
                </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
    );
}

export default SocialProof;