
import Container from "../Container";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import SimpleCard from "../SimpleCard";

const relateCards = [
    {
        title: "Presentes que ninguém esquece",
        desc: "Peças que carregam intenção e viram memória.",
        icon: "🎁",
        key: "presentes",
    },
    {
        title: "Seu chimarrão personalizado",
        desc: "Detalhes que aperfeiçoam seu chimarrão e contam história.",
        icon: "🧉",
        key: "chimarrao",
    },
    {
        title: "Feito à mão, sem pressa",
        desc: "Cada peça começa do zero.",
        icon: "🖐️",
        key: "feito-a-mao",
    },
    {
        title: "Seu jeito, sua ideia",
        desc: "Personalização para transformar referência em peça real.",
        icon: "🎨",
        key: "personalizacao",
    },
];

const Relate = () => (
    <Section >
        <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                <SectionTitle
                    eyebrow="Encontre seu motivo"
                    title="Você vai amar se…"
                    subtitle="A ideia aqui não é comprar qualquer coisa. É escolher uma peça que diga algo — por você ou por alguém."/>
                <div className="grid gap-4 sm:grid-cols-2">
                    {relateCards.map(card => <SimpleCard key={card.key} title={card.title} description={card.desc} icon={card.icon} />)}
                </div>
            </div>
        </Container>
    </Section>
);

export default Relate;