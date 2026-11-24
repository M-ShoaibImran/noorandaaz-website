import type { Order, OrderItem } from "@prisma/client";
import Link from "next/link";
import { paymentLabel, statusLabel } from "@/lib/catalog";
import { OrderProgress } from "@/components/order-progress";
import { formatPrice, formatWhen, safeImage, waLink } from "@/lib/format";
import { formatPhone, toWhatsAppNumber } from "@/lib/phone";

export function OrderDetails({ order }: { order: Order & { items: OrderItem[] } }) {
  const whatsapp = waLink(toWhatsAppNumber(order.phone), `Assalam o Alaikum, this is about Noorandaaz order ${order.orderNumber}.`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Order confirmed</p>
      <h1 className="mt-2 font-serif text-5xl">{order.orderNumber}</h1>
      <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <p className="mt-3 text-sm text-neutral-600">Placed {formatWhen(order.createdAt)} · {statusLabel(order.status)}</p>
      <p className="mt-2 text-sm">Save this number. You can track it later with the same mobile number.</p>
      <Link href={`/track?order=${order.orderNumber}`} className="mt-4 inline-flex h-12 items-center border border-neutral-950 px-5 text-sm">
        Track my order
      </Link>
      <OrderProgress order={order} />

      <section className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {order.items.map((item) => (
          <article key={item.id} className="py-4 text-sm">
            <p className="font-medium">{item.name}</p>
            <p className="mt-1 text-neutral-500">{item.size} · {item.fabric} · Qty {item.quantity}</p>
            <p className="mt-1">{formatPrice(item.price * item.quantity)}</p>
            {item.designNotes ? <p className="mt-2 text-neutral-600">{item.designNotes}</p> : null}
            {item.shirtLength ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                {[
                  ["Shirt", item.shirtLength],
                  ["Chest", item.chest],
                  ["Waist", item.waist],
                  ["Hips", item.hips],
                  ["Shoulder", item.shoulder],
                  ["Sleeve", item.sleeveLength],
                  ["Armhole", item.armhole],
                  ["Trouser", item.trouserLength],
                  ["Bottom", item.trouserBottom],
                  ["Neck", item.neckDepth],
                ].map(([label, value]) => (
                  <div key={label}><dt className="text-neutral-500">{label}</dt><dd>{value} in</dd></div>
                ))}
              </dl>
            ) : null}
            {item.measurementNotes ? <p className="mt-2 text-neutral-600">Notes: {item.measurementNotes}</p> : null}
            {safeImage(item.referenceImage) ? <a className="mt-2 inline-block underline" href={item.referenceImage}>Reference photo</a> : null}
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-2 text-sm">
        <p>{order.customerName} · {formatPhone(order.phone)}</p>
        {order.email ? <p>{order.email}</p> : null}
        <p>{order.address}</p>
        <p>{order.city}</p>
        {order.deliveryNotes ? <p>Notes: {order.deliveryNotes}</p> : null}
        <p>{paymentLabel(order.paymentMethod)}{order.paymentRef ? ` · ${order.paymentRef}` : ""}</p>
        {order.paymentProof ? <p>Payment screenshot received. We will match it before dispatch.</p> : null}
        <p className="pt-2 text-base font-medium">Total {formatPrice(order.total)} <span className="text-sm font-normal text-neutral-500">including delivery {formatPrice(order.deliveryFee)}</span></p>
      </section>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 items-center border border-neutral-950 px-5 text-sm">
        Message us on WhatsApp
      </a>
    </div>
  );
}
