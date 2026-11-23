import { assertSameOrigin, passwordsMatch, setAdminCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as { password?: string };
    if (!body.password || !passwordsMatch(body.password)) {
      return Response.json({ error: "That password is not right." }, { status: 401 });
    }
    await setAdminCookie();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Could not sign in." }, { status: 400 });
  }
}
