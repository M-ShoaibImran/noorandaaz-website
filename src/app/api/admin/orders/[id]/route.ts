import { z } from "zod";
import { assertSameOrigin, isAdmin } from "@/lib/auth";
import { STATUSES } from "@/lib/catalog";
import { db } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await isAdmin())) return Response.json({ error: "Sign in required." }, { status: 401 });
    const { id } = await context.params;
    const parsed = z.object({ status: z.string() }).safeParse(await request.json());
    if (!parsed.success || !STATUSES.some((status) => status.id === parsed.data.status)) {
      return Response.json({ error: "Choose a valid status." }, { status: 400 });
    }
    await db.order.update({ where: { id }, data: { status: parsed.data.status } });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not update." }, { status: 400 });
  }
}
