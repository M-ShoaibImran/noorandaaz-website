import { assertSameOrigin, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { productData } from "@/lib/product-input";

async function guard(request: Request) {
  assertSameOrigin(request);
  if (!(await isAdmin())) return Response.json({ error: "Sign in required." }, { status: 401 });
  return null;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const denied = await guard(request);
    if (denied) return denied;
    const { id } = await context.params;
    const data = await productData(await request.json(), id);
    await db.product.update({ where: { id }, data });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const denied = await guard(request);
    if (denied) return denied;
    const { id } = await context.params;
    await db.product.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not delete." }, { status: 400 });
  }
}
