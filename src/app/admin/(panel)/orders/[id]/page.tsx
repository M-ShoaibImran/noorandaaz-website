import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusSelect } from "@/components/admin/status-select";
import { paymentLabel } from "@/lib/catalog";
import { db } from "@/lib/db";
import { formatPrice, formatWhen, safeImage, waLink } from "@/lib/format";
import { formatPhone, toWhatsAppNumber } from "@/lib/phone";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const whatsapp = waLink(
    toWhatsAppNumber(order.phone),
    `Assalam o Alaikum ${order.customerName}, this is Noorandaaz about order ${order.orderNumber}.`,
  );

  return (
    <div className="max-w-3xl">
      <Link href="/admin" className="text-sm underline">All orders</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">{order.orderNumber}</h1>
        <StatusSelect id={order.id} status={order.status} />
      </div>
      <p className="mt-2 text-sm text-neutral-500">{formatWhen(order.createdAt)}</p>
      <section className="mt-6 space-y-1 text-sm">
        <p>{order.customerName}</p>
        <p>{formatPhone(order.phone)}</p>
        {order.email ? <p>{order.email}</p> : null}
        <p>{order.address}</p>
        <p>{order.city}</p>
        {order.deliveryNotes ? <p>Notes: {order.deliveryNotes}</p> : null}
        <a className="inline-block underline" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp the customer</a>
      </section>
      <section className="mt-6 border border-neutral-200 bg-white p-4 text-sm">
        <p>{paymentLabel(order.paymentMethod)}</p>
        {order.paymentRef ? <p className="mt-1">Reference: {order.paymentRef}</p> : null}
        {safeImage(order.paymentProof) ? (
          <a href={order.paymentProof} target="_blank" rel="noreferrer" className="mt-3 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.paymentProof} alt="Payment screenshot" className="max-h-[36rem] w-full border border-neutral-200 bg-white object-contain" />
            <span className="mt-2 inline-block text-sm underline">Open full size</span>
          </a>
        ) : <p className="mt-2 text-neutral-500">No payment screenshot.</p>}
        <p className="mt-3 font-medium">Total {formatPrice(order.total)} · delivery {formatPrice(order.deliveryFee)}</p>
      </section>
      <ul className="mt-6 space-y-4">
        {order.items.map((item) => (
          <li key={item.id} className="border border-neutral-200 bg-white p-4 text-sm">
            <p className="font-medium">{item.name}</p>
            <p className="text-neutral-500">{item.kind} · {item.size} · {item.fabric} · Qty {item.quantity} · {formatPrice(item.price)}</p>
            {item.designNotes ? <p className="mt-2">{item.designNotes}</p> : null}
            {item.shirtLength ? (
              <p className="mt-2 leading-6">
                Shirt {item.shirtLength}, chest {item.chest}, waist {item.waist}, hips {item.hips}, shoulder {item.shoulder}, sleeve {item.sleeveLength}, armhole {item.armhole}, trouser {item.trouserLength}, bottom {item.trouserBottom}, neck {item.neckDepth}. All inches.
              </p>
            ) : null}
            {item.measurementNotes ? <p className="mt-1">Notes: {item.measurementNotes}</p> : null}
            {safeImage(item.referenceImage) ? <a className="mt-2 inline-block underline" href={item.referenceImage}>Reference photo</a> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
