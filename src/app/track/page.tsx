import type { Metadata } from "next";
import { OrderProgress } from "@/components/order-progress";
import { TrackForm } from "@/components/track-form";
import { canViewOrder } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeOrderNumber } from "@/lib/phone";

export const metadata: Metadata = { title: "Track my order", description: "Track a Noorandaaz order with your order number and mobile number." };

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  const orderNumber = normalizeOrderNumber(params.order || "");
  const allowed = orderNumber ? await canViewOrder(orderNumber) : false;
  const order = allowed ? await db.order.findUnique({ where: { orderNumber }, include: { items: true } }) : null;

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <TrackForm initialOrder={orderNumber} />
      {order ? (
        <div className="px-4">
          <p className="mt-8 font-serif text-3xl">{order.orderNumber}</p>
          <OrderProgress order={order} />
        </div>
      ) : null}
    </div>
  );
}
