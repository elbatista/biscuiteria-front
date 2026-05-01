import Container from "@/components/Container";

export default function ProductNotFound() {
  return (
    <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Container>
        <div className="py-16 text-center">
          <h1 className="font-playfair text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900">
            Produto não encontrado
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)]">
            Esse produto não existe ou não está disponível no momento.
          </p>
        </div>
      </Container>
    </main>
  );
}