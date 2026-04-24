import sharp from "sharp";
import { put } from "@vercel/blob";

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_MAX_FILE_SIZE = 1 * 1024 * 1024;

export type ImageStorageDirectory = "products" | "collections";

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
  const maxFileSize = options?.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

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
  validateImageFile(file, { maxFileSize, allowedTypes });

  const ext = getExtensionFromMime(file.type);
  const originalPathname = `${directory}/${baseName}.${ext}`;
  const thumbPathname = `${directory}/thumbs/${baseName}.webp`;

  const originalBlob = await put(originalPathname, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const thumbBuffer = await sharp(buffer)
    .resize({
      width: thumb?.width ?? 400,
      height: thumb?.height ?? 400,
      fit: thumb?.fit ?? "cover",
    })
    .webp({ quality: thumb?.quality ?? 82 })
    .toBuffer();

  const thumbBlob = await put(thumbPathname, thumbBuffer, {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
  });

  return {
    url: originalBlob.url,
    thumbUrl: thumbBlob.url,
    pathname: originalPathname,
    thumbPathname,
  };
}