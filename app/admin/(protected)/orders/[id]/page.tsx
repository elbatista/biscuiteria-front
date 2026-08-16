import { notFound } from "next/navigation";

import AdminOrderDetails from "@/components/admin/orders/AdminOrderDetails";
import { getAdminOrderById } from "@/lib/admin/orders/get-admin-order";

type AdminOrderDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  title: "Detalhes do pedido | Admin Biscuit_eria",
};

export default async function AdminOrderDetailsPage({
  params,
}: AdminOrderDetailsPageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  const order = await getAdminOrderById(orderId);

  if (!order) {
    notFound();
  }

  return <AdminOrderDetails order={order} />;
}