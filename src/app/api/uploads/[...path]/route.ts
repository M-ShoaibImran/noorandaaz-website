import { readFile, stat } from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";

const ROOT = path.resolve(process.cwd(), "public", "uploads");
const FOLDERS = new Set(["proofs", "products", "references"]);
const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, context: { params: Promise<{ path: string[] }> }) {
  const parts = (await context.params).path ?? [];
  if (parts.length !== 2) return new Response("Not found", { status: 404 });
  const [folder, name] = parts;
  if (!folder || !name || !FOLDERS.has(folder) || !/^[A-Za-z0-9._-]+$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  const type = TYPES[name.split(".").pop()?.toLowerCase() || ""];
  if (!type) return new Response("Not found", { status: 404 });
  if (folder === "proofs" && !(await isAdmin())) {
    return new Response("Sign in required.", { status: 401 });
  }
  const file = path.resolve(ROOT, folder, name);
  if (file !== path.join(ROOT, folder, name)) return new Response("Not found", { status: 404 });
  try {
    const info = await stat(file);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
    const body = await readFile(file);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(body.length),
        "Cache-Control": folder === "proofs" ? "private, no-store" : "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
