"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";

import AdminOperationOverlay from "@/components/admin/AdminOperationOverlay";
import type { AdminProductImage } from "@/components/admin/products/types";

type ProductImagesManagerProps = {
  productId: number;
  initialImages: AdminProductImage[];
};

function sortImages(images: AdminProductImage[]) {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function ProductImagesManager({
  productId,
  initialImages,
}: ProductImagesManagerProps) {
  const [images, setImages] = useState<AdminProductImage[]>(
    sortImages(initialImages)
  );
  const [newImages, setNewImages] = useState<File[]>([]);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOperating = operationMessage !== null;

  async function reloadImagesFromResponse(response: Response) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message ?? "Operação não concluída.");
    }

    if (Array.isArray(data?.images)) {
      setImages(sortImages(data.images));
    }

    return data;
  }

  async function handleUpload() {
    if (newImages.length === 0 || isOperating) {
      return;
    }

    setOperationMessage("Enviando imagens...");
    setError(null);

    try {
      const formData = new FormData();

      for (const image of newImages) {
        formData.append("images", image);
      }

      const response = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await reloadImagesFromResponse(response);

      if (Array.isArray(data?.images)) {
        setImages(sortImages([...images, ...data.images]));
      }

      setNewImages([]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao enviar imagens."
      );
    } finally {
      setOperationMessage(null);
    }
  }

  async function handleDelete(image: AdminProductImage) {
    if (isOperating) {
      return;
    }

    const confirmed = window.confirm("Deseja remover esta imagem do produto?");

    if (!confirmed) {
      return;
    }

    setOperationMessage("Removendo imagem...");
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${image.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? "Não foi possível remover a imagem.");
      }

      setImages((current) =>
        sortImages(current.filter((item) => item.id !== image.id)).map(
          (item, index) => ({
            ...item,
            sortOrder: index,
          })
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao remover imagem."
      );
    } finally {
      setOperationMessage(null);
    }
  }

  async function handleMove(image: AdminProductImage, direction: "up" | "down") {
    if (isOperating) {
      return;
    }

    const ordered = sortImages(images);
    const currentIndex = ordered.findIndex((item) => item.id === image.id);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (!ordered[targetIndex]) {
      return;
    }

    const reordered = [...ordered];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    setOperationMessage("Reordenando imagens...");
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/reorder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            imageIds: reordered.map((item) => item.id),
          }),
        }
      );

      await reloadImagesFromResponse(response);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erro ao reordenar imagens."
      );
    } finally {
      setOperationMessage(null);
    }
  }

  const orderedImages = sortImages(images);

  return (
    <>
      <AdminOperationOverlay
        show={isOperating}
        title={operationMessage ?? "Processando imagens..."}
        description="Aguarde enquanto atualizamos as imagens do produto."
      />

      <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[var(--rose-500)]">
              Imagens
            </p>

            <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
              Imagens do produto
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              A primeira imagem é usada como imagem principal.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-3">
              <ImagePlus className="h-5 w-5 text-[var(--rose-500)]" />

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isOperating}
                onChange={(event) =>
                  setNewImages(
                    event.target.files ? Array.from(event.target.files) : []
                  )
                }
                className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {newImages.length > 0 ? (
              <button
                type="button"
                disabled={isOperating}
                onClick={handleUpload}
                className="mt-3 w-full rounded-2xl bg-[var(--rose-500)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enviar {newImages.length} imagem(ns)
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {orderedImages.map((image, index) => {
            const isFirst = index === 0;
            const isLast = index === orderedImages.length - 1;
            const imageUrl = image.thumbUrl || image.url;

            return (
              <div
                key={image.id}
                className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50"
              >
                <div className="relative aspect-square bg-white">
                  <Image
                    src={imageUrl}
                    alt={image.altText || "Imagem do produto"}
                    fill
                    className="object-cover"
                  />

                  {isFirst ? (
                    <div className="absolute left-3 top-3 rounded-full bg-[var(--rose-500)] px-3 py-1 text-xs font-bold text-white shadow">
                      Principal
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={isOperating || isFirst}
                      onClick={() => handleMove(image, "up")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Mover para cima"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled={isOperating || isLast}
                      onClick={() => handleMove(image, "down")}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={isOperating || orderedImages.length <= 1}
                    onClick={() => handleDelete(image)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Remover imagem"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}