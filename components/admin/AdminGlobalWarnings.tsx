import Link from "next/link";
import { AlertTriangle, Megaphone } from "lucide-react";

type AdminGlobalWarningsProps = {
  status: {
    storeStatus: string;
    storeClosedMessage: string;
    announcementEnabled: boolean;
    announcementMessage: string;
    announcementLinkLabel: string;
    announcementLinkUrl: string;
  };
};

export default function AdminGlobalWarnings({
  status,
}: AdminGlobalWarningsProps) {
  const storeIsClosed = status.storeStatus === "closed";
  const announcementIsActive = status.announcementEnabled;

  if (!storeIsClosed && !announcementIsActive) {
    return null;
  }

  return (
    <section className="border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
        {storeIsClosed ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-bold">Atenção: a loja está fechada</p>

                  <p className="mt-1 text-sm leading-6 text-red-700">
                    {status.storeClosedMessage ||
                      "A loja pública está marcada como fechada."}
                  </p>
                </div>
              </div>

              <Link
                href="/admin/settings/store"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-200"
              >
                Alterar status
              </Link>
            </div>
          </div>
        ) : null}

        {announcementIsActive ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <Megaphone className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-bold">Aviso ativo no site</p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    {status.announcementMessage ||
                      "Existe uma barra de aviso ativa na loja pública."}

                    {status.announcementLinkLabel &&
                    status.announcementLinkUrl ? (
                      <>
                        {" "}
                        Link:{" "}
                        <span className="font-semibold">
                          {status.announcementLinkLabel}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              <Link
                href="/admin/settings/announcement"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
              >
                Editar aviso
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}