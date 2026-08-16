import AdminOrdersPageClient from "@/components/admin/orders/AdminOrdersPageClient";
import {
  getAdminOrders,
  type AdminOrdersSearchParams,
} from "@/lib/admin/orders/get-admin-orders";

type AdminOrdersPageProps = {
  searchParams: Promise<AdminOrdersSearchParams>;
};

export const metadata = {
  title: "Pedidos | Admin Biscuit_eria",
};

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const result = await getAdminOrders(resolvedSearchParams);

  return <AdminOrdersPageClient result={result} />;
}