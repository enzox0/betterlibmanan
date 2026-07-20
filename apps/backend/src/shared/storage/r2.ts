import { randomUUID } from "crypto";
import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface UploadBase64ImageInput {
  data: string;
  filename: string;
  mimeType: string;
  folder?: string;
}

export interface UploadedObject {
  key: string;
  url: string;
}

let cachedClient: S3Client | null = null;

function storageError(message: string, statusCode = 500) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw storageError(`Missing required storage configuration: ${name}`, 500);
  }
  return value;
}

function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
}

function getBucketName(): string {
  return getRequiredEnv("R2_BUCKET_NAME");
}

function getPublicBaseUrl(): string {
  return getRequiredEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");
}

function decodeBase64Image(data: string): Buffer {
  const sanitized = data.includes(",") ? (data.split(",").pop() ?? "") : data;
  const buffer = Buffer.from(sanitized, "base64");

  if (buffer.length === 0) {
    throw storageError("Image payload is empty", 400);
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw storageError("Image must be 5MB or smaller", 400);
  }

  return buffer;
}

async function convertImageToWebp(buffer: Buffer): Promise<Buffer> {
  try {
    const { imageToWebp } = await import("imgtowebp/node");
    const result = await imageToWebp(buffer, { targetBytes: 250_000 });
    const webpArrayBuffer = await result.blob.arrayBuffer();
    return Buffer.from(webpArrayBuffer);
  } catch (err: any) {
    if (err?.statusCode) throw err;
    throw storageError("Failed to convert image to WebP", 400);
  }
}

export async function uploadBase64ImageToR2(
  input: UploadBase64ImageInput,
): Promise<UploadedObject> {
  if (!IMAGE_MIME_TYPES.has(input.mimeType)) {
    throw storageError("Unsupported image type", 400);
  }

  const buffer = decodeBase64Image(input.data);
  const webpBuffer = await convertImageToWebp(buffer);
  const folder = (input.folder ?? "uploads").replace(/^\/+|\/+$/g, "");
  const key = `${folder}/${randomUUID()}.webp`;

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: webpBuffer,
      ContentType: "image/webp",
    }),
  );

  return {
    key,
    url: `${getPublicBaseUrl()}/${key}`,
  };
}

export async function deleteObjectFromR2(
  key: string | null | undefined,
): Promise<void> {
  if (!key) return;

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
}
