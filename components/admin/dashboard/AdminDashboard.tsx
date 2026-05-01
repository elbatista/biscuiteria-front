import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ExternalLink,
  FolderTree,
  HelpCircle,
  ImageIcon,
  Layers3,
  Megaphone,
  PackagePlus,
  RefreshCw,
  Settings,
  Store,
  Tag,
  Truck,
  XCircle,
} from "lucide-react";

import type { AdminDashboardData } from "@/lib/admin/get-admin-dashboard-data";

type AdminDashboardProps = {
  data: AdminDashboardData;
};

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Não disponível";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não disponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function truncate(value: string, maxLength = 80) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength)}...`;
}

function getAnnouncementPreview(message: string) {
  return message.trim() ? truncate(message, 60) : "Nenhum aviso cadastrado";
}

function StatusPill({
  tone,
  children,
}: {
  tone: "success" | "danger" | "warning" | "neutral";
  children: React.ReactNode;
}) {
  const classes = {
    success: "bg-green-50 text-green-700 ring-green-200",
    danger: "bg-red-50 text-red-700 ring-red-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        classes[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function CompactControllerCard({
  title,
  value,
  description,
  href,
  icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  tone: "success" | "danger" | "warning" | "neutral";
}) {
  const toneClasses = {
    success: "border-green-200 bg-green-50",
    danger: "border-red-200 bg-red-50",
    warning: "border-amber-200 bg-amber-50",
    neutral: "border-zinc-200 bg-white",
  };

  return (
    <Link
      href={href}
      className={[
        "group rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        toneClasses[tone],
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 ring-1 ring-black/5">
          {icon}
        </div>

        <span className="text-xs font-bold text-zinc-400 transition group-hover:text-[var(--rose-500)]">
          →
        </span>
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {title}
        </p>

        <h2 className="mt-1 text-lg font-bold text-zinc-950">{value}</h2>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      </div>
    </Link>
  );
}

function CompactMetricCard({
  title,
  value,
  href,
  icon,
  tags,
  warnings = [],
}: {
  title: string;
  value: number;
  href: string;
  icon: React.ReactNode;
  tags: Array<{
    label: string;
    tone: "success" | "danger" | "warning" | "neutral";
  }>;
  warnings?: string[];
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[var(--rose-500)]">
          {icon}
        </div>

        <div className="text-right">
          <div className="text-2xl font-black leading-none text-zinc-950">
            {value}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            total
          </div>
        </div>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-zinc-950">{title}</h3>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <StatusPill key={tag.label} tone={tag.tone}>
            {tag.label}
          </StatusPill>
        ))}
      </div>

      {warnings.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          {warnings.slice(0, 2).map((warning) => (
            <div
              key={warning}
              className="flex items-center gap-2 rounded-xl bg-amber-50 px-2.5 py-2 text-[11px] font-semibold text-amber-800 ring-1 ring-amber-200"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {warning}
            </div>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

function QuickAction({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[var(--rose-500)]">
        {icon}
      </div>

      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">
        {title}
      </span>

      <span className="text-sm font-bold text-zinc-300 transition group-hover:text-[var(--rose-500)]">
        →
      </span>
    </Link>
  );
}

function WarningItem({
  title,
  description,
  href,
  tone,
}: {
  title: string;
  description: string;
  href: string;
  tone: "danger" | "warning";
}) {
  const classes =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-900";

  return (
    <Link
      href={href}
      className={[
        "flex items-start gap-2.5 rounded-2xl border p-3 transition hover:brightness-95",
        classes,
      ].join(" ")}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

      <div className="min-w-0">
        <p className="text-sm font-bold">{title}</p>
        <p className="mt-1 text-xs leading-5 opacity-80">{description}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
  const storeIsClosed = data.settings.storeStatus === "closed";
  const announcementIsActive = data.settings.announcementEnabled;

  const warnings = [
    storeIsClosed
      ? {
          title: "A loja está fechada",
          description:
            data.settings.storeClosedMessage ||
            "A loja pública está marcada como fechada.",
          href: "/admin/settings/store",
          tone: "danger" as const,
        }
      : null,

    announcementIsActive
      ? {
          title: "Aviso ativo no site",
          description: getAnnouncementPreview(data.settings.announcementMessage),
          href: "/admin/settings/announcement",
          tone: "warning" as const,
        }
      : null,

    data.products.withoutImage > 0
      ? {
          title: `${data.products.withoutImage} produto(s) sem imagem`,
          description:
            "Produtos sem imagem ficam menos atrativos no catálogo.",
          href: "/admin/products",
          tone: "warning" as const,
        }
      : null,

    data.products.withoutCategory > 0
      ? {
          title: `${data.products.withoutCategory} produto(s) sem categoria`,
          description: "Produtos sem categoria podem ser mais difíceis de achar.",
          href: "/admin/products",
          tone: "warning" as const,
        }
      : null,

    data.categories.total === 0
      ? {
          title: "Nenhuma categoria cadastrada",
          description: "Crie categorias para organizar a loja.",
          href: "/admin/categories/new",
          tone: "warning" as const,
        }
      : null,

    data.collections.total === 0
      ? {
          title: "Nenhuma coleção cadastrada",
          description: "Coleções ajudam a criar vitrines temáticas.",
          href: "/admin/collections/new",
          tone: "warning" as const,
        }
      : null,

    data.faq.total === 0
      ? {
          title: "Nenhuma pergunta no FAQ",
          description: "Adicione perguntas frequentes para ajudar clientes.",
          href: "/admin/settings/faq/new",
          tone: "warning" as const,
        }
      : null,

    !data.settings.shippingOriginComplete
      ? {
          title: "Origem do frete incompleta",
          description: "Complete o endereço de origem do frete.",
          href: "/admin/settings/shipping-origin",
          tone: "warning" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    description: string;
    href: string;
    tone: "danger" | "warning";
  }>;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--rose-500)]">
              Dashboard
            </p>

            <h1 className="mt-1 font-playfair text-2xl font-semibold text-zinc-950 sm:text-3xl">
              Biscuiteria Admin 🧉
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Resumo da operação, atalhos e alertas.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <StatusPill tone="neutral">
              Atualizado {formatUpdatedAt(data.settings.updatedAt)}
            </StatusPill>

            <StatusPill tone={storeIsClosed ? "danger" : "success"}>
              {storeIsClosed ? "Loja fechada" : "Loja aberta"}
            </StatusPill>

            <StatusPill tone={announcementIsActive ? "warning" : "neutral"}>
              {announcementIsActive ? "Aviso ativo" : "Sem aviso"}
            </StatusPill>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <CompactControllerCard
          title="Loja"
          value={storeIsClosed ? "Fechada" : "Aberta"}
          description={
            storeIsClosed
              ? data.settings.storeClosedMessage || "Fechada no momento."
              : "Disponível para clientes."
          }
          href="/admin/settings/store"
          icon={
            storeIsClosed ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )
          }
          tone={storeIsClosed ? "danger" : "success"}
        />

        <CompactControllerCard
          title="Aviso"
          value={announcementIsActive ? "Ativo" : "Inativo"}
          description={getAnnouncementPreview(data.settings.announcementMessage)}
          href="/admin/settings/announcement"
          icon={<Megaphone className="h-5 w-5 text-amber-600" />}
          tone={announcementIsActive ? "warning" : "neutral"}
        />

        <CompactControllerCard
          title="Frete"
          value={data.settings.shippingOriginComplete ? "Configurado" : "Pendente"}
          description={
            data.settings.shippingOriginComplete
              ? `${data.settings.originCity || "Cidade"} - ${
                  data.settings.originState || "UF"
                }`
              : "Origem de frete incompleta."
          }
          href="/admin/settings/shipping-origin"
          icon={<Truck className="h-5 w-5 text-zinc-700" />}
          tone={data.settings.shippingOriginComplete ? "success" : "warning"}
        />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <CompactMetricCard
          title="Produtos"
          value={data.products.total}
          href="/admin/products"
          icon={<Boxes className="h-4.5 w-4.5" />}
          tags={[
            { label: `${data.products.active} ativos`, tone: "success" },
            {
              label: `${data.products.inactive} inativos`,
              tone: data.products.inactive > 0 ? "danger" : "neutral",
            },
            {
              label: `${data.products.featured} destaque`,
              tone: data.products.featured > 0 ? "warning" : "neutral",
            },
          ]}
          warnings={[
            data.products.withoutImage > 0
              ? `${data.products.withoutImage} sem imagem`
              : "",
            data.products.withoutCategory > 0
              ? `${data.products.withoutCategory} sem categoria`
              : "",
          ].filter(Boolean)}
        />

        <CompactMetricCard
          title="Categorias"
          value={data.categories.total}
          href="/admin/categories"
          icon={<FolderTree className="h-4.5 w-4.5" />}
          tags={[
            { label: `${data.categories.active} ativas`, tone: "success" },
            {
              label: `${data.categories.inactive} inativas`,
              tone: data.categories.inactive > 0 ? "danger" : "neutral",
            },
          ]}
          warnings={[
            data.categories.total === 0 ? "Nenhuma categoria" : "",
            data.categories.total > 0 && data.categories.active === 0
              ? "Nenhuma ativa"
              : "",
          ].filter(Boolean)}
        />

        <CompactMetricCard
          title="Coleções"
          value={data.collections.total}
          href="/admin/collections"
          icon={<Layers3 className="h-4.5 w-4.5" />}
          tags={[
            { label: `${data.collections.active} ativas`, tone: "success" },
            {
              label: `${data.collections.inactive} inativas`,
              tone: data.collections.inactive > 0 ? "danger" : "neutral",
            },
            {
              label: `${data.collections.featured} destaque`,
              tone: data.collections.featured > 0 ? "warning" : "neutral",
            },
          ]}
          warnings={[
            data.collections.total === 0 ? "Nenhuma coleção" : "",
          ].filter(Boolean)}
        />

        <CompactMetricCard
          title="FAQ"
          value={data.faq.total}
          href="/admin/settings/faq"
          icon={<HelpCircle className="h-4.5 w-4.5" />}
          tags={[
            { label: `${data.faq.active} ativas`, tone: "success" },
            {
              label: `${data.faq.inactive} inativas`,
              tone: data.faq.inactive > 0 ? "danger" : "neutral",
            },
          ]}
          warnings={[
            data.faq.total === 0 ? "Nenhuma FAQ" : "",
            data.faq.total > 0 && data.faq.active === 0
              ? "Nenhuma ativa"
              : "",
          ].filter(Boolean)}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.3fr_1fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--rose-500)]">
                Ações rápidas
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                Atalhos
              </h2>
            </div>

            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 transition hover:text-zinc-950"
            >
              Configurações
              <RefreshCw className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <QuickAction
              title="Novo produto"
              href="/admin/products/new"
              icon={<PackagePlus className="h-4.5 w-4.5" />}
            />

            <QuickAction
              title="Nova categoria"
              href="/admin/categories/new"
              icon={<Tag className="h-4.5 w-4.5" />}
            />

            <QuickAction
              title="Nova coleção"
              href="/admin/collections/new"
              icon={<Layers3 className="h-4.5 w-4.5" />}
            />

            <QuickAction
              title="Nova FAQ"
              href="/admin/settings/faq/new"
              icon={<HelpCircle className="h-4.5 w-4.5" />}
            />

            <QuickAction
              title="Funcionamento"
              href="/admin/settings/store"
              icon={<Store className="h-4.5 w-4.5" />}
            />

            <QuickAction
              title="Aviso do site"
              href="/admin/settings/announcement"
              icon={<Megaphone className="h-4.5 w-4.5" />}
            />

            <QuickAction
              title="Origem do frete"
              href="/admin/settings/shipping-origin"
              icon={<Truck className="h-4.5 w-4.5" />}
            />

            <QuickAction
              title="Configurações"
              href="/admin/settings"
              icon={<Settings className="h-4.5 w-4.5" />}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--rose-500)]">
                Operação
              </p>
              <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                Status rápido
              </h2>
            </div>

            <Link
              href="/loja"
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 transition hover:text-zinc-950"
            >
              Loja
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-2">
            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Loja
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                {storeIsClosed ? "Fechada" : "Aberta"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Aviso
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                {announcementIsActive ? "Ativo" : "Inativo"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                CEP origem
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                {data.settings.originZipCode || "Não informado"}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Cidade
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-950">
                {[data.settings.originCity, data.settings.originState]
                  .filter(Boolean)
                  .join(" - ") || "Não informada"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--rose-500)]">
              Alertas
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-950">
              Atenção
            </h2>
          </div>

          {warnings.length === 0 ? (
            <div className="rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-700 ring-1 ring-green-200">
              Tudo certo no momento.
            </div>
          ) : (
            <div className="space-y-2">
              {warnings.slice(0, 6).map((warning) => (
                <WarningItem
                  key={warning.title}
                  title={warning.title}
                  description={warning.description}
                  href={warning.href}
                  tone={warning.tone}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--rose-500)]">
            Recentes
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">
            Produtos atualizados
          </h2>
        </div>

        {data.latestProducts.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
            Nenhum produto cadastrado ainda.
          </div>
        ) : (
          <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
            {data.latestProducts.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 p-3 transition hover:bg-zinc-50"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-950">
                    {product.name}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-1">
                    <StatusPill tone={product.active ? "success" : "neutral"}>
                      {product.active ? "ativo" : "inativo"}
                    </StatusPill>

                    {product.featured ? (
                      <StatusPill tone="warning">destaque</StatusPill>
                    ) : null}
                  </div>
                </div>

                <div className="hidden text-right text-[11px] text-zinc-400 sm:block">
                  {formatUpdatedAt(product.updatedAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}