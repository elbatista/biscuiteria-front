import type { Metadata } from "next";

import ChangePasswordForm from "@/components/admin/account/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Minha conta | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAccountPage() {
  return <ChangePasswordForm />;
}