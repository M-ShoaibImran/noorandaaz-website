import Link from "next/link";
import { RestoreOrder } from "@/components/admin/remove-order";
import { StatusSelect } from "@/components/admin/status-select";
import { paymentLabel, statusLabel } from "@/lib/catalog";
import { db } from "@/lib/db";
import { formatPrice, formatWhen } from "@/lib/format";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const view = (await searchParams).view === "removed" ? "removed" : "open";
  const [orders, removedCount] = await Promise.all([
    db.order.findMany({
      where: view === "removed" ? { status: "removed" } : { status: { not: "removed" } },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 100,
    }),
    db.order.count({ where: { status: "removed" } }),
  ]);
  const counts = ["pending", "confirmed", "stitching", "dispatched", "delivered"].map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className={`border px-3 py-2 ${view === "open" ? "border-neutral-950 bg-white" : "border-neutral-200 bg-white text-neutral-500"}`}>Open</Link>
        <Link href="/admin?view=removed" className={`border px-3 py-2 ${view === "removed" ? "border-neutral-950 bg-white" : "border-neutral-200 bg-white text-neutral-500"}`}>Removed {removedCount}</Link>
      </div>
      {view === "open" ? (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {counts.map((item) => (
            <span key={item.status} className="border border-neutral-200 bg-white px-3 py-2">
              {statusLabel(item.status)} {item.count}
            </span>
          ))}
        </div>
      ) : null}
      {orders.length === 0 ? <p className="mt-8 text-sm text-neutral-600">{view === "removed" ? "No removed orders." : "No orders yet. They will appear here after checkout."}</p> : null}
      <ul className="mt-6 divide-y divide-neutral-200 border border-neutral-200 bg-white">
        {orders.map((order) => (
          <li key={order.id} className="grid gap-3 p-4 md:grid-cols-[1.4fr_0.8fr_auto] md:items-center">
            <div>
              <Link href={`/admin/orders/${order.id}`} className="font-medium underline">{order.orderNumber}</Link>
              <p className="mt-1 text-sm">{order.customerName} · {order.phone}</p>
              <p className="text-xs text-neutral-500">{order.city} · {formatWhen(order.createdAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
              {order.status === "removed" && order.customerRemarks ? <p className="mt-1 text-sm">{order.customerRemarks}</p> : null}
            </div>
            <div>
              <p className="text-sm">{formatPrice(order.total)} · {paymentLabel(order.paymentMethod)}</p>
              <p className="mt-1">
                {order.paymentProof ? (
                  <span className="inline-block border border-[#b8893b] bg-white px-2 py-0.5 text-[11px] text-[#1c1917]">Screenshot attached</span>
                ) : (
                  <span className="inline-block border border-[#e7e2da] bg-white px-2 py-0.5 text-[11px] text-neutral-500">No screenshot</span>
                )}
              </p>
            </div>
            {order.status === "removed" ? (
              <RestoreOrder id={order.id} />
            ) : (
              <div className="flex flex-col items-start gap-2">
                <StatusSelect id={order.id} status={order.status} />
                <Link href={`/admin/orders/${order.id}#remove`} className="text-xs text-[#9b1c1c] underline">Remove</Link>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
