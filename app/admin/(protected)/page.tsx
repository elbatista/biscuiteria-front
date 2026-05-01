import type { Metadata } from "next";

import AdminDashboard from "@/components/admin/dashboard/AdminDashboard";
import { getAdminDashboardData } from "@/lib/admin/get-admin-dashboard-data";

export const metadata: Metadata = {
  title: "Dashboard | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminHomePage() {
  const data = await getAdminDashboardData();

  return <AdminDashboard data={data} />;
}