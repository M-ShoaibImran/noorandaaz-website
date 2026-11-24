const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, number[]>();

export function clientIp(request: Request) {
  const cloudflare = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflare) return cloudflare;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  return real || "unknown";
}

export function consumeLoginAttempt(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    const retryAfter = Math.max(1, Math.ceil((recent[0] + WINDOW_MS - now) / 1000));
    return { ok: false as const, retryAfter };
  }
  recent.push(now);
  attempts.set(ip, recent);
  return { ok: true as const };
}
