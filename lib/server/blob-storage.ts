import sharp from "sharp";
import { put } from "@vercel/blob";

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DEFAULT_MAX_FILE_SIZE = 1 * 1024 * 1024;

const DEFAULT_OPTIMIZED_MAX_WIDTH = 2000;
const DEFAULT_OPTIMIZED_MAX_HEIGHT = 2000;
const DEFAULT_OPTIMIZED_TARGET_FILE_SIZE = 900 * 1024;
const DEFAULT_OPTIMIZED_INITIAL_QUALITY = 85;
const DEFAULT_OPTIMIZED_MIN_QUALITY = 50;
const DEFAULT_OPTIMIZED_QUALITY_STEP = 5;
const DEFAULT_OPTIMIZED_MIN_DIMENSION = 900;

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
  optimizeOriginal?: {
    maxWidth?: number;
    maxHeight?: number;
    targetFileSize?: number;
    initialQuality?: number;
    minQuality?: number;
    qualityStep?: number;
    minDimension?: number;
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

type OptimizeOriginalOptions = NonNullable<
  UploadImageWithThumbOptions["optimizeOriginal"]
>;

async function optimizeImageNearTarget(
  inputBuffer: Buffer,
  options: OptimizeOriginalOptions
) {
  const maxWidth =
    options.maxWidth ?? DEFAULT_OPTIMIZED_MAX_WIDTH;
  const maxHeight =
    options.maxHeight ?? DEFAULT_OPTIMIZED_MAX_HEIGHT;
  const targetFileSize =
    options.targetFileSize ?? DEFAULT_OPTIMIZED_TARGET_FILE_SIZE;
  const initialQuality =
    options.initialQuality ?? DEFAULT_OPTIMIZED_INITIAL_QUALITY;
  const minQuality =
    options.minQuality ?? DEFAULT_OPTIMIZED_MIN_QUALITY;
  const qualityStep = Math.max(
    1,
    options.qualityStep ?? DEFAULT_OPTIMIZED_QUALITY_STEP
  );
  const minDimension =
    options.minDimension ?? DEFAULT_OPTIMIZED_MIN_DIMENSION;

  let currentMaxWidth = maxWidth;
  let currentMaxHeight = maxHeight;
  let bestBuffer: Buffer | null = null;

  // Primeiro tentamos reduzir somente a qualidade. Caso ainda fique acima
  // do alvo, diminuímos as dimensões e repetimos o processo.
  for (let resizeAttempt = 0; resizeAttempt < 5; resizeAttempt++) {
    for (
      let quality = initialQuality;
      quality >= minQuality;
      quality -= qualityStep
    ) {
      const outputBuffer = await sharp(inputBuffer, {
        limitInputPixels: 40_000_000,
      })
        .rotate()
        .resize({
          width: Math.round(currentMaxWidth),
          height: Math.round(currentMaxHeight),
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality,
          effort: 4,
        })
        .toBuffer();

      if (!bestBuffer || outputBuffer.length < bestBuffer.length) {
        bestBuffer = outputBuffer;
      }

      if (outputBuffer.length <= targetFileSize) {
        return outputBuffer;
      }
    }

    if (!bestBuffer) {
      break;
    }

    const scaleFromSize = Math.sqrt(
      targetFileSize / bestBuffer.length
    );

    const nextScale = Math.min(0.9, Math.max(0.7, scaleFromSize * 0.95));

    const nextWidth = Math.max(
      minDimension,
      Math.round(currentMaxWidth * nextScale)
    );

    const nextHeight = Math.max(
      minDimension,
      Math.round(currentMaxHeight * nextScale)
    );

    if (
      nextWidth === currentMaxWidth &&
      nextHeight === currentMaxHeight
    ) {
      break;
    }

    currentMaxWidth = nextWidth;
    currentMaxHeight = nextHeight;
  }

  if (!bestBuffer) {
    throw new Error("INVALID_IMAGE_CONTENT");
  }

  return bestBuffer;
}

export async function uploadImageWithThumb({
  file,
  directory,
  baseName,
  thumb,
  optimizeOriginal,
  maxFileSize,
  allowedTypes,
}: UploadImageWithThumbOptions): Promise<UploadImageWithThumbResult> {
  validateImageFile(file, {
    maxFileSize,
    allowedTypes,
  });

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  let originalBuffer: Buffer | File = file;
  let originalContentType = file.type;
  let originalExtension = getExtensionFromMime(file.type);

  if (optimizeOriginal) {
    try {
      originalBuffer = await optimizeImageNearTarget(
        inputBuffer,
        optimizeOriginal
      );
      originalContentType = "image/webp";
      originalExtension = "webp";
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "INVALID_IMAGE_CONTENT"
      ) {
        throw error;
      }

      throw new Error("INVALID_IMAGE_CONTENT");
    }
  }

  const originalPathname =
    `${directory}/${baseName}.${originalExtension}`;

  const thumbPathname =
    `${directory}/thumbs/${baseName}.webp`;

  const originalBlob = await put(
    originalPathname,
    originalBuffer,
    {
      access: "public",
      contentType: originalContentType,
      addRandomSuffix: false,
    }
  );

  let thumbBuffer: Buffer;

  try {
    thumbBuffer = await sharp(inputBuffer, {
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize({
        width: thumb?.width ?? 400,
        height: thumb?.height ?? 400,
        fit: thumb?.fit ?? "cover",
      })
      .webp({
        quality: thumb?.quality ?? 82,
      })
      .toBuffer();
  } catch {
    throw new Error("INVALID_IMAGE_CONTENT");
  }

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
