import type { Metadata } from "next";

import CollectionEditPageClient from "@/components/admin/collections/CollectionEditPageClient";

type AdminCollectionEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar coleção | Admin | Biscuiteria",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminCollectionEditPage({
  params,
}: AdminCollectionEditPageProps) {
  const { id } = await params;

  return <CollectionEditPageClient collectionId={id} />;
}