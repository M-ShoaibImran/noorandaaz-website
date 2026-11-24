import { assertSameOrigin, passwordsMatch, setAdminCookie } from "@/lib/auth";
import { clientIp, consumeLoginAttempt } from "@/lib/login-rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const limit = consumeLoginAttempt(clientIp(request));
    if (!limit.ok) {
      return Response.json(
        { error: "Too many sign-in attempts. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }
    const body = (await request.json()) as { password?: string };
    if (!body.password || !(await passwordsMatch(body.password))) {
      return Response.json({ error: "That password is not right." }, { status: 401 });
    }
    await setAdminCookie();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not sign in." }, { status: 400 });
  }
}
