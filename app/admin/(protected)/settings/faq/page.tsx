import type { Metadata } from "next";

import FaqPageClient from "@/components/admin/faq/FaqPageClient";

export const metadata: Metadata = {
  title: "FAQ | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminFaqPage() {
  return <FaqPageClient />;
}