import {
  Boxes,
  FolderTree,
  Gauge,
  HelpCircle,
  Home,
  Layers3,
  Settings,
  Store,
} from "lucide-react";

export const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Gauge,
  },
  {
    label: "Produtos",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    label: "Categorias",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Coleções",
    href: "/admin/collections",
    icon: Layers3,
  },
  {
    label: "FAQ",
    href: "/admin/settings/faq",
    icon: HelpCircle,
  },
  {
    label: "Configurações",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const adminExternalNavItems = [
  {
    label: "Ver loja",
    href: "/",
    icon: Home,
  },
  {
    label: "Abrir catálogo",
    href: "/loja",
    icon: Store,
  },
];

export function isActiveAdminPath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}