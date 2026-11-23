import { mkdir, writeFile } from "fs/promises";
import path from "path";

function extension(buffer: Buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function saveImage(file: File, folder: string) {
  if (file.size <= 0) throw new Error("Choose an image.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Images must be under 5 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extension(buffer);
  if (!ext) throw new Error("Upload a JPG, PNG, or WebP image.");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const directory = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), buffer);
  return `/uploads/${folder}/${name}`;
}

export function isManagedImage(src: string) {
  return (src.startsWith("/images/") || src.startsWith("/uploads/")) && !src.includes("..");
}
