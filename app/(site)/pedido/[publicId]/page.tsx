import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AnnouncementBar from "@/components/AnnouncementBar";
import PublicOrderDetails from "@/components/order/PublicOrderDetails";
import { getPublicOrderByPublicId } from "@/lib/server/orders";

type PageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const order = await getPublicOrderByPublicId(publicId);

  if (!order) {
    return {
      title: "Pedido não encontrado | Biscuit_eria",
    };
  }

  return {
    title: `${order.publicId} | Biscuit_eria`,
    description: "Detalhes do pedido enviado para a Biscuit_eria.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PublicOrderPage({ params }: PageProps) {
  const { publicId } = await params;
  const order = await getPublicOrderByPublicId(publicId);

  if (!order) {
    notFound();
  }

  return (
    <>
      <AnnouncementBar />
      <PublicOrderDetails order={order} />
    </>
  );
}