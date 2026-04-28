import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getPublicStoreSettings } from "@/lib/server/public-store-settings";

function isExternalUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export default async function AnnouncementBar() {
  const settings = await getPublicStoreSettings();

  if (!settings.announcementEnabled || !settings.announcementMessage?.trim()) {
    return null;
  }

  const linkUrl = settings.announcementLinkUrl;
  const linkLabel = settings.announcementLinkLabel?.trim();

  return (
    <div className="border-b border-[var(--rose-100)] bg-[var(--green-500)] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-3 text-center text-sm font-medium sm:flex-row sm:px-8">
        <div className="flex items-center justify-center gap-2">
          <Megaphone className="h-4 w-4 shrink-0" />
          <span>{settings.announcementMessage}</span>
        </div>

        {linkUrl && linkLabel ? (
          isExternalUrl(linkUrl) ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-4 transition hover:text-[var(--rose-50)]"
            >
              {linkLabel}
            </a>
          ) : (
            <Link
              href={linkUrl}
              className="font-semibold underline underline-offset-4 transition hover:text-[var(--rose-50)]"
            >
              {linkLabel}
            </Link>
          )
        ) : null}
      </div>
    </div>
  );
}