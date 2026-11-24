import { createHmac, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "na_admin";
const VIEW_COOKIE = "na_view";
const SAMPLE_PASSWORD = "noorandaaz-admin";

function env(name: string) {
  return process.env[name];
}

function secret() {
  return env("SESSION_SECRET") || "dev-session-secret-change-me";
}

export function showsSamplePasswordHint() {
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

function hashMatches(input: string, configured: string) {
  const match = /^scrypt\$([0-9a-fA-F]+)\$([0-9a-fA-F]+)$/.exec(configured.trim());
  if (!match) {
    if (!warnedBadHash) {
      warnedBadHash = true;
      console.warn("ADMIN_PASSWORD_HASH is set but is not scrypt$salt$hash. In .env, escape each $ as \\$.");
    }
    return false;
  }
  const salt = match[1];
  const expected = Buffer.from(match[2], "hex");
  if (expected.length !== 64 || match[2].length !== 128) return false;
  const actual = scryptSync(input, salt, 64);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function passwordsMatch(input: string) {
  const configured = env("ADMIN_PASSWORD_HASH")?.trim();
  if (configured) return hashMatches(input, configured);
  const expected = env("ADMIN_PASSWORD") || SAMPLE_PASSWORD;
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function setAdminCookie() {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sign(`admin.${expires}`), options(60 * 60 * 24 * 7));
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin() {
  const jar = await cookies();
  const value = readSigned(jar.get(ADMIN_COOKIE)?.value);
  if (!value?.startsWith("admin.")) return false;
  const expires = Number(value.slice("admin.".length));
  return Number.isFinite(expires) && expires > Date.now();
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
