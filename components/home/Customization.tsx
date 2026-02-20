import Container from "../Container";
import SectionTitle from "../SectionTitle";
import Section from "../Section";
import Button from "../Button";
import Badge from "../Badge";
import SimpleCard from "../SimpleCard";

const customizationSteps = [
    { icon: "💭", title: "Você imagina", desc: "Referências e ideia", key: "imagina" },
    { icon: "💬", title: "A gente conversa", desc: "Ajustes e detalhes", key: "conversa" },
    { icon: "🫶", title: "A peça nasce", desc: "Moldada à mão", key: "nasce" },
];

const briefing = [
    { label: "Ocasião", value: "Aniversário / Casamento", key: "ocasiao" },
    { label: "Tema", value: "Pet / profissão / hobbies / times de futebol", key: "tema" },
    { label: "Detalhes", value: "Cores, mensagem, elementos especiais", key: "detalhes" },
];

const Customization = () => {
    return (
    <Section color="rose">
        <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div className="space-y-6">
                    <SectionTitle
                        eyebrow="Personalizados"
                        title="Tem algo em mente? A gente cria junto."
                        subtitle="Você conta a ideia. Eu transformo em biscuit ou kit chimarrão - com carinho, intenção e um acabamento que faz valer a espera."/>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {customizationSteps.map(step => <SimpleCard key={step.key} title={step.title} description={step.desc} icon={step.icon}/>)}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button href="/personalizados">Quero criar uma peça</Button>
                        <Button href="/contato" variant="secondary">Tirar dúvidas</Button>
                    </div>
                </div>
                <div className="rounded-[2rem] border border-[var(--rose-100)] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-zinc-900">Exemplo de briefing</div>
                        <Badge>rápido &amp; simples</Badge>
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-zinc-700">
                        {briefing.map(b => 
                        <div key={b.key} className="rounded-3xl bg-[var(--rose-100)]/60 p-4">
                            <div className="text-xs text-[var(--text-muted)]">{b.label}</div>
                            <div className="mt-1 font-medium">{b.value}</div>
                        </div>
                        )}
                    </div>
                    <div className="mt-6">
                        <Button href="/personalizados" variant="secondary">Preencher pedido personalizado</Button>
                    </div>
                </div>
            </div>
        </Container>
    </Section>
    );
}

export default Customization;