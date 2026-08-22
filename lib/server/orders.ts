import { prisma } from "@/lib/prisma";

function maskName(
  name: string
) {
  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length === 0) {
    return "Cliente";
  }

  if (parts.length === 1) {
    const first = parts[0];

    if (first.length <= 2) {
      return `${first[0] ?? ""}***`;
    }

    return `${first.slice(0, 2)}***`;
  }

  const firstName =
    parts[0];

  const lastName =
    parts[parts.length - 1];

  return `${firstName} ${lastName[0] ?? ""}.`;
}

function maskEmail(
  email: string
) {
  const [local, domain] =
    email.split("@");

  if (!local || !domain) {
    return "e-mail informado";
  }

  const visibleStart =
    local.slice(
      0,
      Math.min(
        2,
        local.length
      )
    );

  const domainParts =
    domain.split(".");

  const domainName =
    domainParts[0] ?? "";

  const extension =
    domainParts
      .slice(1)
      .join(".");

  const maskedLocal =
    `${visibleStart}${"*".repeat(
      Math.max(
        3,
        local.length -
          visibleStart.length
      )
    )}`;

  const maskedDomain =
    domainName.length <= 2
      ? `${domainName[0] ?? ""}***`
      : `${domainName.slice(0, 2)}***`;

  return `${maskedLocal}@${maskedDomain}${
    extension
      ? `.${extension}`
      : ""
  }`;
}

function maskPhone(
  phone: string | null
) {
  if (!phone) {
    return "-";
  }

  const digits =
    phone.replace(
      /\D/g,
      ""
    );

  if (digits.length < 4) {
    return "***";
  }

  return `(**) *****-${digits.slice(-4)}`;
}

function maskDocument(
  document: string | null
) {
  if (!document) {
    return null;
  }

  const digits =
    document.replace(
      /\D/g,
      ""
    );

  if (digits.length !== 11) {
    return "***";
  }

  return `***.***.***-${digits.slice(-2)}`;
}

function maskStreet(
  street: string
) {
  const trimmed =
    street.trim();

  if (!trimmed) {
    return "Endereço informado";
  }

  const words =
    trimmed
      .split(/\s+/)
      .filter(Boolean);

  if (words.length <= 1) {
    return `${trimmed.slice(0, 3)}***`;
  }

  return `${words[0]} ${
    words[1]?.slice(0, 2) ?? ""
  }***`;
}

function maskAddressNumber(
  number: string
) {
  const trimmed =
    number.trim();

  if (!trimmed) {
    return "***";
  }

  if (trimmed.length <= 2) {
    return "***";
  }

  return `***${trimmed.slice(-1)}`;
}

function maskZipCode(
  zipCode: string
) {
  const digits =
    zipCode.replace(
      /\D/g,
      ""
    );

  if (digits.length !== 8) {
    return "***";
  }

  return `*****-${digits.slice(-3)}`;
}

export type PublicOrderDetails = {
  id: number;
  publicId: string;

  status: string;
  paymentStatus: string;
  currency: string;

  /**
   * Todos estes dados já chegam mascarados
   * à camada pública.
   */
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocument: string | null;

  /**
   * A página pública só precisa saber
   * se houve observações.
   *
   * O conteúdo completo nunca sai desta
   * camada de servidor.
   */
  hasCustomerNotes: boolean;

  itemsCount: number;
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;

  shippingServiceName: string | null;

  paymentProvider: string | null;
  sourceChannel: string | null;

  /**
   * Campo criado na etapa anterior.
   *
   * Se você já o adicionou ao projeto,
   * mantenha exatamente assim.
   */
  creationEmailStatus: string;

  trackingCode: string | null;
  trackingUrl: string | null;

  createdAt: Date;
  updatedAt: Date;
  paidAt: Date | null;
  shippedAt: Date | null;
  cancelledAt: Date | null;

  items: {
    id: number;
    productId: number | null;
    productNameSnapshot: string;
    productSlugSnapshot: string | null;
    skuSnapshot: string | null;

    selectedColorId: number | null;
    selectedColorNameSnapshot: string | null;
    selectedColorHexSnapshot: string | null;

    unitPriceInCents: number;
    quantity: number;
    lineTotalInCents: number;
  }[];

  shippingAddress: {
    id: number;

    recipientName: string;
    zipCode: string;
    street: string;
    number: string;

    /**
     * Complemento não é utilizado atualmente
     * na página pública.
     *
     * Portanto não devolvemos.
     */

    neighborhood: string;

    /**
     * Cidade/UF podem ser exibidas completas.
     * Elas não identificam diretamente o endereço.
     */
    city: string;
    state: string;
    country: string;
  } | null;

  statusHistory: {
    id: number;
    fromStatus: string | null;
    toStatus: string;
    reason: string | null;
    createdAt: Date;
  }[];
};

export async function getPublicOrderByPublicId(
  publicId: string
): Promise<PublicOrderDetails | null> {
  /**
   * Importante:
   *
   * usamos select explícito em vez de carregar
   * o Order inteiro.
   *
   * Assim esta função pública não recebe
   * acidentalmente campos novos/sensíveis
   * adicionados futuramente ao model Order.
   */
  const order =
    await prisma.order.findUnique({
      where: {
        publicId,
      },

      select: {
        id: true,
        publicId: true,

        status: true,
        paymentStatus: true,
        currency: true,

        customerName: true,
        customerEmail: true,
        customerPhone: true,
        customerDocument: true,

        /**
         * Só lemos para converter em boolean.
         * O texto em si não será devolvido.
         */
        customerNotes: true,

        itemsCount: true,
        subtotalInCents: true,
        shippingInCents: true,
        totalInCents: true,

        shippingServiceName: true,

        paymentProvider: true,
        sourceChannel: true,

        creationEmailStatus: true,

        trackingCode: true,
        trackingUrl: true,

        createdAt: true,
        updatedAt: true,
        paidAt: true,
        shippedAt: true,
        cancelledAt: true,

        items: {
          orderBy: {
            id: "asc",
          },

          select: {
            id: true,
            productId: true,

            productNameSnapshot:
              true,

            productSlugSnapshot:
              true,

            skuSnapshot:
              true,

            selectedColorId:
              true,

            selectedColorNameSnapshot:
              true,

            selectedColorHexSnapshot:
              true,

            unitPriceInCents:
              true,

            quantity: true,

            lineTotalInCents:
              true,
          },
        },

        shippingAddress: {
          select: {
            id: true,

            recipientName:
              true,

            zipCode: true,
            street: true,
            number: true,

            neighborhood:
              true,

            city: true,
            state: true,
            country: true,
          },
        },

        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            reason: true,
            createdAt: true,
          },
        },
      },
    });

  if (!order) {
    return null;
  }

  return {
    id:
      order.id,

    publicId:
      order.publicId,

    status:
      order.status,

    paymentStatus:
      order.paymentStatus,

    currency:
      order.currency,

    /**
     * Os dados completos deixam de existir
     * depois deste ponto.
     */
    customerName:
      maskName(
        order.customerName
      ),

    customerEmail:
      maskEmail(
        order.customerEmail
      ),

    customerPhone:
      maskPhone(
        order.customerPhone
      ),

    customerDocument:
      maskDocument(
        order.customerDocument
      ),

    hasCustomerNotes:
      Boolean(
        order.customerNotes?.trim()
      ),

    itemsCount:
      order.itemsCount,

    subtotalInCents:
      order.subtotalInCents,

    shippingInCents:
      order.shippingInCents,

    totalInCents:
      order.totalInCents,

    shippingServiceName:
      order.shippingServiceName,

    paymentProvider:
      order.paymentProvider,

    sourceChannel:
      order.sourceChannel,

    creationEmailStatus:
      order.creationEmailStatus,

    trackingCode:
      order.trackingCode,

    trackingUrl:
      order.trackingUrl,

    createdAt:
      order.createdAt,

    updatedAt:
      order.updatedAt,

    paidAt:
      order.paidAt,

    shippedAt:
      order.shippedAt,

    cancelledAt:
      order.cancelledAt,

    items:
      order.items.map(
        (item) => ({
          id:
            item.id,

          productId:
            item.productId,

          productNameSnapshot:
            item.productNameSnapshot,

          productSlugSnapshot:
            item.productSlugSnapshot,

          skuSnapshot:
            item.skuSnapshot,

          selectedColorId:
            item.selectedColorId,

          selectedColorNameSnapshot:
            item.selectedColorNameSnapshot,

          selectedColorHexSnapshot:
            item.selectedColorHexSnapshot,

          unitPriceInCents:
            item.unitPriceInCents,

          quantity:
            item.quantity,

          lineTotalInCents:
            item.lineTotalInCents,
        })
      ),

    shippingAddress:
      order.shippingAddress
        ? {
            id:
              order.shippingAddress.id,

            recipientName:
              maskName(
                order.shippingAddress
                  .recipientName
              ),

            zipCode:
              maskZipCode(
                order.shippingAddress
                  .zipCode
              ),

            street:
              maskStreet(
                order.shippingAddress
                  .street
              ),

            number:
              maskAddressNumber(
                order.shippingAddress
                  .number
              ),

            neighborhood:
              maskStreet(
                order.shippingAddress
                  .neighborhood
              ),

            city:
              order.shippingAddress.city,

            state:
              order.shippingAddress.state,

            country:
              order.shippingAddress.country,
          }
        : null,

    statusHistory:
      order.statusHistory.map(
        (history) => ({
          id:
            history.id,

          fromStatus:
            history.fromStatus,

          toStatus:
            history.toStatus,

          reason:
            history.reason,

          createdAt:
            history.createdAt,
        })
      ),
  };
}