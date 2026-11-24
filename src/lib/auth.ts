import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyScrypt } from "@/lib/password";

const ADMIN_COOKIE = "na_admin";
const VIEW_COOKIE = "na_view";
const SAMPLE_PASSWORD = "noorandaaz-admin";

function env(name: string) {
  return process.env[name];
}

function secret() {
  return env("SESSION_SECRET") || "dev-session-secret-change-me";
}

const HASH_KEY = "adminPasswordHash";
const VERSION_KEY = "adminSessionVersion";

async function setting(key: string) {
  const row = await db.shopSetting.findUnique({ where: { key } });
  return row?.value ?? "";
}

export async function showsSamplePasswordHint() {
  if (await setting(HASH_KEY)) return false;
  return !env("ADMIN_PASSWORD_HASH")?.trim() && (env("ADMIN_PASSWORD") || SAMPLE_PASSWORD) === SAMPLE_PASSWORD;
}

function sign(value: string) {
  const signature = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${signature}`;
}

function readSigned(token: string | undefined) {
  if (!token) return null;
  const splitAt = token.lastIndexOf(".");
  if (splitAt <= 0) return null;
  const value = token.slice(0, splitAt);
  const signature = token.slice(splitAt + 1);
  const expected = createHmac("sha256", secret()).update(value).digest("hex");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return value;
}

function options(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

let warnedBadHash = false;

export async function passwordsMatch(input: string) {
  const stored = (await setting(HASH_KEY)).trim();
  if (stored) return verifyScrypt(input, stored);
  const configured = env("ADMIN_PASSWORD_HASH")?.trim();
  if (configured) {
    const ok = verifyScrypt(input, configured);
    if (!ok && !/^scrypt\$[0-9a-fA-F]+\$[0-9a-fA-F]+$/.test(configured) && !warnedBadHash) {
      warnedBadHash = true;
      console.warn("ADMIN_PASSWORD_HASH is set but is not scrypt$salt$hash. In .env, escape each $ as \\$.");
    }
    return ok;
  }
  const expected = env("ADMIN_PASSWORD") || SAMPLE_PASSWORD;
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function sessionVersion() {
  const value = Number((await setting(VERSION_KEY)) || "0");
  return Number.isFinite(value) ? value : 0;
}

export async function saveAdminPassword(hash: string) {
  const version = (await sessionVersion()) + 1;
  await db.shopSetting.upsert({
    where: { key: HASH_KEY },
    create: { key: HASH_KEY, value: hash },
    update: { value: hash },
  });
  await db.shopSetting.upsert({
    where: { key: VERSION_KEY },
    create: { key: VERSION_KEY, value: String(version) },
    update: { value: String(version) },
  });
}

export async function setAdminCookie() {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const version = await sessionVersion();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sign(`admin.${version}.${expires}`), options(60 * 60 * 24 * 7));
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin() {
  const jar = await cookies();
  const value = readSigned(jar.get(ADMIN_COOKIE)?.value);
  if (!value?.startsWith("admin.")) return false;
  const parts = value.split(".");
  let version = 0;
  let expires = 0;
  if (parts.length === 2) {
    expires = Number(parts[1]);
  } else if (parts.length === 3) {
    version = Number(parts[1]);
    expires = Number(parts[2]);
  } else {
    return false;
  }
  if (!Number.isFinite(version) || !Number.isFinite(expires) || expires <= Date.now()) return false;
  return version === (await sessionVersion());
}

export async function grantOrderView(orderNumber: string) {
  const jar = await cookies();
  jar.set(VIEW_COOKIE, sign(`order:${orderNumber}`), options(60 * 60 * 24 * 45));
}

export async function canViewOrder(orderNumber: string) {
  const jar = await cookies();
  return readSigned(jar.get(VIEW_COOKIE)?.value) === `order:${orderNumber}`;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error("This request was rejected.");
  }
  if (!host || originHost !== host) throw new Error("This request was rejected.");
}
