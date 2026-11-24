import Link from "next/link";
import { StatusSelect } from "@/components/admin/status-select";
import { paymentLabel, statusLabel } from "@/lib/catalog";
import { db } from "@/lib/db";
import { formatPrice, formatWhen } from "@/lib/format";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });
  const counts = ["pending", "confirmed", "stitching", "dispatched", "delivered"].map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {counts.map((item) => (
          <span key={item.status} className="border border-neutral-200 bg-white px-3 py-2">
            {statusLabel(item.status)} {item.count}
          </span>
        ))}
      </div>
      {orders.length === 0 ? <p className="mt-8 text-sm text-neutral-600">No orders yet. They will appear here after checkout.</p> : null}
      <ul className="mt-6 divide-y divide-neutral-200 border border-neutral-200 bg-white">
        {orders.map((order) => (
          <li key={order.id} className="grid gap-3 p-4 md:grid-cols-[1.4fr_0.8fr_auto] md:items-center">
            <div>
              <Link href={`/admin/orders/${order.id}`} className="font-medium underline">{order.orderNumber}</Link>
              <p className="mt-1 text-sm">{order.customerName} · {order.phone}</p>
              <p className="text-xs text-neutral-500">{order.city} · {formatWhen(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
            </div>
            <p className="text-sm">{formatPrice(order.total)} · {paymentLabel(order.paymentMethod)}</p>
            <p className="mt-1">
              {order.paymentProof ? (
                <span className="inline-block border border-[#b8893b] bg-white px-2 py-0.5 text-[11px] text-[#1c1917]">Screenshot attached</span>
              ) : (
                <span className="inline-block border border-[#e7e2da] bg-white px-2 py-0.5 text-[11px] text-neutral-500">No screenshot</span>
              )}
            </p>
            <StatusSelect id={order.id} status={order.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
