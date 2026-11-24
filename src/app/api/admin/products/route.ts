import { jsonError } from "@/lib/api-error";
import { assertSameOrigin, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { productData } from "@/lib/product-input";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!(await isAdmin())) return Response.json({ error: "Sign in required." }, { status: 401 });
    const data = await productData(await request.json());
    const product = await db.product.create({ data });
    return Response.json({ id: product.id });
  } catch (error) {
    return jsonError(error, "Could not save.");
  }
}
