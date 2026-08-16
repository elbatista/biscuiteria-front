import sharp from "sharp";
import { put } from "@vercel/blob";

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DEFAULT_MAX_FILE_SIZE = 1 * 1024 * 1024;

export type ImageStorageDirectory =
  | "products"
  | "collections"
  | "about";

export type UploadImageWithThumbOptions = {
  file: File;
  directory: ImageStorageDirectory;
  baseName: string;
  thumb?: {
    width: number;
    height: number;
    fit?: "cover" | "contain" | "fill" | "inside" | "outside";
    quality?: number;
  };
  maxFileSize?: number;
  allowedTypes?: string[];
};

export type UploadImageWithThumbResult = {
  url: string;
  thumbUrl: string;
  pathname: string;
  thumbPathname: string;
};

export type UploadOptimizedImageOptions = {
  file: File;
  directory: ImageStorageDirectory;
  baseName: string;

  maxWidth?: number;
  maxHeight?: number;
  quality?: number;

  maxFileSize?: number;
  allowedTypes?: string[];
};

export type UploadOptimizedImageResult = {
  url: string;
  pathname: string;
  width: number;
  height: number;
};

export function getExtensionFromMime(type: string) {
  switch (type) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "bin";
  }
}

export function validateImageFile(
  file: File,
  options?: {
    maxFileSize?: number;
    allowedTypes?: string[];
  }
) {
  const maxFileSize =
    options?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;

  const allowedTypes =
    options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`INVALID_FILE_TYPE:${file.type}`);
  }

  if (file.size > maxFileSize) {
    throw new Error(`FILE_TOO_LARGE:${file.name}`);
  }
}

export async function uploadImageWithThumb({
  file,
  directory,
  baseName,
  thumb,
  maxFileSize,
  allowedTypes,
}: UploadImageWithThumbOptions): Promise<UploadImageWithThumbResult> {
  validateImageFile(file, {
    maxFileSize,
    allowedTypes,
  });

  const ext = getExtensionFromMime(file.type);

  const originalPathname =
    `${directory}/${baseName}.${ext}`;

  const thumbPathname =
    `${directory}/thumbs/${baseName}.webp`;

  const originalBlob = await put(
    originalPathname,
    file,
    {
      access: "public",
      addRandomSuffix: false,
    }
  );

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const thumbBuffer = await sharp(buffer)
    .resize({
      width: thumb?.width ?? 400,
      height: thumb?.height ?? 400,
      fit: thumb?.fit ?? "cover",
    })
    .webp({
      quality: thumb?.quality ?? 82,
    })
    .toBuffer();

  const thumbBlob = await put(
    thumbPathname,
    thumbBuffer,
    {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
    }
  );

  return {
    url: originalBlob.url,
    thumbUrl: thumbBlob.url,
    pathname: originalPathname,
    thumbPathname,
  };
}

/**
 * Recebe uma imagem enviada pelo admin, corrige sua orientação,
 * reduz suas dimensões máximas e grava somente uma versão WebP
 * otimizada no Vercel Blob.
 *
 * Usado principalmente para imagens institucionais, onde não
 * precisamos manter original + thumbnail separados.
 */
export async function uploadOptimizedImage({
  file,
  directory,
  baseName,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 85,
  maxFileSize,
  allowedTypes,
}: UploadOptimizedImageOptions): Promise<UploadOptimizedImageResult> {
  validateImageFile(file, {
    maxFileSize,
    allowedTypes,
  });

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  let outputBuffer: Buffer;

  try {
    outputBuffer = await sharp(inputBuffer, {
      limitInputPixels: 40_000_000,
    })
      // Corrige fotos de celular com orientação EXIF.
      .rotate()
      .resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality,
      })
      .toBuffer();
  } catch {
    throw new Error("INVALID_IMAGE_CONTENT");
  }

  let metadata: sharp.Metadata;

  try {
    metadata = await sharp(outputBuffer).metadata();
  } catch {
    throw new Error("INVALID_IMAGE_CONTENT");
  }

  const pathname =
    `${directory}/${baseName}.webp`;

  const blob = await put(
    pathname,
    outputBuffer,
    {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
    }
  );

  return {
    url: blob.url,
    pathname,
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };
}