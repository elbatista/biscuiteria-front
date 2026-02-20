import Container from "../Container";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import Button from "../Button";
import LinkCard from "../LinkCard";

const products = [
    {
        title: "Enfeites para o seu chimarrão",
        desc: "Deixe o seu mate ainda mais bonito.",
        href: "/loja?colecao=enfeite-chimarrao",
        tag: "🌼",
        key: "enfeites",
    },
    {
        title: "Acessórios para chimarrão",
        desc: "Cuias, bombas, e muito mais.",
        href: "/loja?colecao=acessorios",
        tag: "🧉",
        key: "acessorios",
    },
    {
        title: "Detalhes para a casa",
        desc: "Pequenos pontos de calor.",
        href: "/loja?colecao=casa",
        tag: "🏡",
        key: "casa",
    },
    {
        title: "Datas especiais",
        desc: "Aniversário, casamento, etc.",
        href: "/loja?colecao=datas",
        tag: "💐",
        key: "datas",
    },
];

const Collections = () => (
    <Section color="green">
        <Container>
            <div className="flex flex-col gap-8">
                <SectionTitle
                    eyebrow="Curadoria"
                    title="Coleções para escolher com facilidade"
                    subtitle="Produtos separados por intenção: enfeites, chimas, casa e momentos especiais." />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map(p => 
                    <LinkCard key={p.key}
                        href={p.href}
                        title={p.title}
                        description={p.desc}
                        tag={p.tag} />
                    )}
                </div>
                <div><Button href="/loja">Ver todas as peças</Button></div>
            </div>
        </Container>
    </Section>
);

export default Collections;