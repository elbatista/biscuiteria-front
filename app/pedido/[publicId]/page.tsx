import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import ContactSupportCard from "@/components/store/ContactSupportCard";
import { formatBRLFromCents } from "@/lib/format-price";
import { getOrderByPublicId } from "@/lib/server/orders";

type PageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { publicId } = await params;

  return {
    title: `Pedido ${publicId} | Biscuit_eria`,
    description: "Acompanhe os detalhes do seu pedido.",
  };
}

function statusLabel(status: string) {
  switch (status) {
    case "pending_payment":
      return "Aguardando pagamento";
    case "confirmed":
      return "Confirmado";
    case "processing":
      return "Em preparação";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregue";
    case "canceled":
      return "Cancelado";
    case "refunded":
      return "Reembolsado";
    default:
      return status;
  }
}

export default async function OrderPage({ params }: PageProps) {
  const { publicId } = await params;

  const order = await getOrderByPublicId(publicId);

  if (!order) {
    notFound();
  }

  return (
    <main className="bg-[var(--rose-50)] text-[var(--text-main)]">
      <Container>
        <div className="py-10">
          <div className="rounded-3xl border border-[var(--rose-100)] bg-white p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--green-500)]">
              Pedido criado
            </p>

            <h1 className="mt-2 font-playfair text-4xl font-semibold tracking-tight text-zinc-900">
              {order.publicId}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Seu pedido foi criado com sucesso. O próximo passo será integrar o
              pagamento, então por enquanto ele ficará como pendente.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-50)] p-4">
                <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Status do pedido
                </div>
                <div className="mt-1 text-lg font-semibold text-zinc-900">
                  {statusLabel(order.status)}
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--rose-100)] bg-[var(--rose-50)] p-4">
                <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  Status do pagamento
                </div>
                <div className="mt-1 text-lg font-semibold text-zinc-900">
                  {order.paymentStatus}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Itens</h2>

              <div className="mt-5 space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-b border-[var(--rose-100)] pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-900">
                        {item.productNameSnapshot}
                      </div>

                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        Quantidade: {item.quantity}
                      </div>

                      {item.productSlugSnapshot ? (
                        <Link
                          href={`/produtos/${item.productSlugSnapshot}`}
                          className="mt-2 inline-flex text-xs font-medium text-[var(--green-500)] hover:underline"
                        >
                          Ver produto
                        </Link>
                      ) : null}
                    </div>

                    <div className="text-sm font-semibold text-zinc-900">
                      {formatBRLFromCents(item.lineTotalInCents)}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-6">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Cliente
                </h2>

                <div className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
                  <p>
                    <strong className="text-zinc-900">Nome:</strong>{" "}
                    {order.customerName}
                  </p>
                  <p>
                    <strong className="text-zinc-900">E-mail:</strong>{" "}
                    {order.customerEmail}
                  </p>
                  {order.customerPhone ? (
                    <p>
                      <strong className="text-zinc-900">Telefone:</strong>{" "}
                      {order.customerPhone}
                    </p>
                  ) : null}
                  {order.customerDocument ? (
                    <p>
                      <strong className="text-zinc-900">CPF:</strong>{" "}
                      {order.customerDocument}
                    </p>
                  ) : null}
                </div>
              </section>

              {order.shippingAddress ? (
                <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-6">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Entrega
                  </h2>

                  <div className="mt-5 space-y-2 text-sm text-[var(--text-muted)]">
                    <p>{order.shippingAddress.recipientName}</p>
                    <p>
                      {order.shippingAddress.street},{" "}
                      {order.shippingAddress.number}
                    </p>
                    {order.shippingAddress.complement ? (
                      <p>{order.shippingAddress.complement}</p>
                    ) : null}
                    <p>{order.shippingAddress.neighborhood}</p>
                    <p>
                      {order.shippingAddress.city} -{" "}
                      {order.shippingAddress.state}
                    </p>
                    <p>CEP: {order.shippingAddress.zipCode}</p>
                  </div>
                </section>
              ) : null}

              <section className="rounded-3xl border border-[var(--rose-100)] bg-white p-6">
                <h2 className="text-lg font-semibold text-zinc-900">Totais</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Subtotal</span>
                    <span>{formatBRLFromCents(order.subtotalInCents)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Frete</span>
                    <span>{formatBRLFromCents(order.shippingInCents)}</span>
                  </div>

                  <div className="border-t border-[var(--rose-100)] pt-3">
                    <div className="flex items-center justify-between text-base font-semibold text-zinc-900">
                      <span>Total</span>
                      <span>{formatBRLFromCents(order.totalInCents)}</span>
                    </div>
                  </div>
                </div>
              </section>

              <ContactSupportCard
                title="Dúvidas sobre seu pedido?"
                description="Fale conosco pelo WhatsApp ou e-mail informando o número do pedido."
              />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}