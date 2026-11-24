import { assertSameOrigin, isAdmin, passwordsMatch, saveAdminPassword, setAdminCookie } from "@/lib/auth";
import { clientIp, consumeLoginAttempt } from "@/lib/login-rate-limit";
import { hashPassword, passwordRuleError } from "@/lib/password";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await isAdmin())) return Response.json({ error: "Sign in required." }, { status: 401 });
    const limit = consumeLoginAttempt(clientIp(request));
    if (!limit.ok) {
      return Response.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }
    const body = (await request.json()) as { current?: string; next?: string; confirm?: string };
    const current = body.current || "";
    const next = body.next || "";
    const confirm = body.confirm || "";
    if (!(await passwordsMatch(current))) {
      return Response.json({ error: "The current password is not right." }, { status: 401 });
    }
    const rule = passwordRuleError(next);
    if (rule) return Response.json({ error: rule }, { status: 400 });
    if (next !== confirm) return Response.json({ error: "The two new passwords do not match." }, { status: 400 });
    if (next === current) return Response.json({ error: "Choose a password that is different from the current one." }, { status: 400 });
    await saveAdminPassword(hashPassword(next));
    await setAdminCookie();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not change the password." }, { status: 400 });
  }
}
