import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import { getAdminGlobalStatus } from "@/lib/admin/get-admin-global-status";
import { getCurrentAdminUser } from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  const globalStatus = await getAdminGlobalStatus();

  return (
    <AdminShell user={user} globalStatus={globalStatus}>
      {children}
    </AdminShell>
  );
}