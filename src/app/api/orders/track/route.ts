import { jsonError } from "@/lib/api-error";
import { assertSameOrigin, grantOrderView } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPakistaniMobile, normalizeOrderNumber, normalizePhone, ORDER_NOT_FOUND_MESSAGE, ORDER_NUMBER_MESSAGE, PHONE_MESSAGE } from "@/lib/phone";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as { orderNumber?: string; phone?: string };
    const orderNumber = normalizeOrderNumber(body.orderNumber || "");
    const phone = normalizePhone(body.phone || "");
    if (!orderNumber) return Response.json({ error: ORDER_NUMBER_MESSAGE, code: "order" }, { status: 400 });
    if (!isPakistaniMobile(phone)) return Response.json({ error: PHONE_MESSAGE, code: "phone" }, { status: 400 });

    const direct = await db.order.findUnique({ where: { orderNumber } });
    let order = direct && normalizePhone(direct.phone) === phone ? direct : null;
    if (!order) {
      const rows = await db.order.findMany();
      order = rows.find((row) => normalizeOrderNumber(row.orderNumber) === orderNumber && normalizePhone(row.phone) === phone) ?? null;
    }
    if (!order) return Response.json({ error: ORDER_NOT_FOUND_MESSAGE, code: "missing" }, { status: 404 });
    await grantOrderView(order.orderNumber);
    return Response.json({ ok: true, orderNumber: order.orderNumber });
  } catch (error) {
    return jsonError(error);
  }
}
