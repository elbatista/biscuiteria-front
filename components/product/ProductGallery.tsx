"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type ProductGalleryImage = {
  id: number;
  url: string;
  thumbUrl: string | null;
  altText: string | null;
  sortOrder: number;
};

interface ProductGalleryProps {
  productName: string;
  images: ProductGalleryImage[];
}

const FALLBACK_IMAGE = "/placeholder.png";

export default function ProductGallery({
  productName,
  images,
}: ProductGalleryProps) {
  const safeImages = useMemo(() => {
    if (images.length > 0) return images;

    return [
      {
        id: 0,
        url: FALLBACK_IMAGE,
        thumbUrl: FALLBACK_IMAGE,
        altText: productName,
        sortOrder: 0,
      },
    ];
  }, [images, productName]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selectedImage = safeImages[selectedIndex];

  function openLightbox(index: number) {
    setSelectedIndex(index);
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  function goPrev() {
    setSelectedIndex((prev) =>
      prev === 0 ? safeImages.length - 1 : prev - 1
    );
  }

  function goNext() {
    setSelectedIndex((prev) =>
      prev === safeImages.length - 1 ? 0 : prev + 1
    );
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!lightboxOpen) return;

      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, safeImages.length]);

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openLightbox(selectedIndex)}
          className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-3xl border border-[var(--rose-100)] bg-white"
        >
          <Image
            src={selectedImage.url || FALLBACK_IMAGE}
            alt={selectedImage.altText || productName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />

          <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-zinc-900 shadow-sm">
            Clique para ampliar
          </div>
        </button>

        {safeImages.length > 1 ? (
          <div className="grid grid-cols-4 gap-3">
            {safeImages.map((image, index) => {
              const thumbSrc = image.thumbUrl || image.url || FALLBACK_IMAGE;
              const isActive = index === selectedIndex;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={[
                    "relative aspect-square cursor-pointer overflow-hidden rounded-2xl border bg-white transition",
                    isActive
                      ? "border-zinc-900 ring-1 ring-zinc-900"
                      : "border-[var(--rose-100)] hover:border-zinc-300",
                  ].join(" ")}
                >
                  <Image
                    src={thumbSrc}
                    alt={image.altText || `${productName} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12vw"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-zinc-900"
          >
            Fechar
          </button>

          {safeImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 cursor-pointer rounded-full bg-white/90 px-4 py-3 text-lg text-zinc-900"
                aria-label="Imagem anterior"
              >
                ←
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 cursor-pointer rounded-full bg-white/90 px-4 py-3 text-lg text-zinc-900"
                aria-label="Próxima imagem"
              >
                →
              </button>
            </>
          ) : null}

          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={selectedImage.url || FALLBACK_IMAGE}
              alt={selectedImage.altText || productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}