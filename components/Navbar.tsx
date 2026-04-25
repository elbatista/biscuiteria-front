import NavbarClient from "@/components/NavbarClient";
import { getPublicStoreContactSettings } from "@/lib/server/public-store-settings";

export default async function Navbar() {
  const contact = await getPublicStoreContactSettings();

  return <NavbarClient storeName={contact.storeName} />;
}