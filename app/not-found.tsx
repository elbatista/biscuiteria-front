import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Container from "@/components/Container";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center">
      <Container>
        <div className="grid gap-1 lg:grid-cols-1 lg:items-center">
          <div className="space-y-6">
            <Badge>Página não encontrada</Badge>
            <h1 className="font-playfair text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
              Opa… essa página não existe.
            </h1>
            <p className="max-w-md text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
              Parece que você chegou a um cantinho que ainda não foi moldado.
              Mas não se preocupe — tem muita coisa bonita esperando por você.
            </p>
            <Button href="/">Voltar para o início</Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
