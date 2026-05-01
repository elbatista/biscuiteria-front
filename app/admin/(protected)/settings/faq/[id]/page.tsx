import type { Metadata } from "next";

import FaqEditPageClient from "@/components/admin/faq/FaqEditPageClient";

type AdminFaqEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar pergunta | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminFaqEditPage({
  params,
}: AdminFaqEditPageProps) {
  const { id } = await params;

  return <FaqEditPageClient faqItemId={id} />;
}