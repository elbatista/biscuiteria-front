import Image from 'next/image';
import Container from '../Container';
import Button from '../Button';
import Badge from '../Badge';

const badges = [
    { label: 'Artesanal', key: 'handmade' },
    { label: 'Encomendas personalizadas', key: 'custom-orders' },
    { label: 'Peças prontas para envio', key: 'ready-to-ship' },
];

const highlights = [
    { label: 'Prazo médio', value: 'sob consulta 📦', key: 'delivery-time' },
    { label: 'Personalização', value: 'do seu jeito 🎨', key: 'customization' },
    { label: 'Envio para', value: 'todo Brasil 🇧🇷', key: 'shipping' },
];

const title = 'Aqui você encontra tudo para o seu chimarrão 🧉';
const description = 'Enfeites personalizados, cuias e acessórios para decorar, presentear e encantar.';

const Hero = () => (
    <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--rose-50)] via-white to-white" />
        <Container>
        <div className="relative grid gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                    {badges.map(badge => <Badge key={badge.key}>{badge.label}</Badge>)}
                </div>
                <h1 className="font-playfair text-4xl font-semibold tracking-tight sm:text-5xl text-[var(--green-500)]">
                    {title}
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
                    {description}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button href="/loja">Descobrir as peças</Button>
                    <Button href="/personalizados" variant="secondary">Criar algo só meu</Button>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                    {
                    highlights.map(highlight => (
                        <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-4 shadow-sm" key={highlight.key}>
                            <div className="text-xs text-[var(--text-muted)]">
                                {highlight.label}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-zinc-900">
                                {highlight.value}
                            </div>
                        </div>
                    ))
                    }
                </div>
            </div>
            {/* Visual placeholder */}
            <div className="relative">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[var(--rose-100)] bg-white shadow-sm">
                    <div className="h-full w-full bg-gradient-to-br from-[var(--rose-100)] via-white to-[var(--green-50)]" />
                    <div className="absolute inset-0 grid place-items-center text-center">
                        <Image
                            className="object-cover overflow-hidden rounded-[2rem]"
                            src="/fotos/5.jpeg"
                            alt="Foto destaque"
                            width={600}
                            height={700}/>
                    </div>
                </div>
                <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-40 w-40 rounded-[2.5rem] border border-[var(--rose-100)] bg-white/70 shadow-sm backdrop-blur lg:block" />
                <div className="pointer-events-none absolute -top-6 -right-6 hidden h-28 w-28 rounded-[2.2rem] border border-[var(--rose-100)] bg-white/70 shadow-sm backdrop-blur lg:block" />
            </div>
        </div>
        </Container>
    </section>
);

export default Hero;