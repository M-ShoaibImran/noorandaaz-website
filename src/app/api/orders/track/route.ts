import { assertSameOrigin, grantOrderView } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPakistaniMobile, normalizePhone } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as { orderNumber?: string; phone?: string };
    const orderNumber = (body.orderNumber || "").trim().toUpperCase();
    const phone = normalizePhone(body.phone || "");
    if (!orderNumber || !isPakistaniMobile(phone)) {
      return Response.json({ error: "Enter the order number and a Pakistani mobile number." }, { status: 400 });
    }
    const order = await db.order.findUnique({ where: { orderNumber } });
    if (!order || order.phone !== phone) {
      return Response.json({ error: "We couldn't find an order with those details." }, { status: 404 });
    }
    await grantOrderView(order.orderNumber);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "We couldn't find an order with those details." }, { status: 400 });
  }
}
