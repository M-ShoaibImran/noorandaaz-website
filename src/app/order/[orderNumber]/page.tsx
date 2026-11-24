import type { Metadata } from "next";
import { OrderDetails } from "@/components/order-details";
import { OrderGate } from "@/components/order-gate";
import { canViewOrder } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeOrderNumber } from "@/lib/phone";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const orderNumber = normalizeOrderNumber(decodeURIComponent((await params).orderNumber));
  const allowed = orderNumber ? await canViewOrder(orderNumber) : false;
  if (!allowed) return <OrderGate orderNumber={orderNumber || (await params).orderNumber} />;
  const order = await db.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!order) return <OrderGate orderNumber={orderNumber} />;
  return <OrderDetails order={order} />;
}
