"use client";

import {
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
} from "react-share";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-sm font-medium text-[var(--text-muted)]">COMPARTILHAR:</span>
        <div className="flex flex-wrap items-center gap-3">

        <WhatsappShareButton
            url={shareUrl}
            title={title}
            separator=" - "
            className="cursor-pointer transition hover:opacity-85"
            aria-label="Compartilhar no WhatsApp"
        >
            <WhatsappIcon size={38} round />
        </WhatsappShareButton>

        <FacebookShareButton
            url={shareUrl}
            hashtag="#chimarrao"
            className="cursor-pointer transition hover:opacity-85"
            aria-label="Compartilhar no Facebook"
        >
            <FacebookIcon size={38} round />
        </FacebookShareButton>

        <TelegramShareButton
            url={shareUrl}
            title={title}
            className="cursor-pointer transition hover:opacity-85"
            aria-label="Compartilhar no Telegram"
        >
            <TelegramIcon size={38} round />
        </TelegramShareButton>

        <TwitterShareButton
            url={shareUrl}
            title={title}
            className="cursor-pointer transition hover:opacity-85"
            aria-label="Compartilhar no X"
        >
            <TwitterIcon size={38} round />
        </TwitterShareButton>
        </div>
    </div>
  );
}