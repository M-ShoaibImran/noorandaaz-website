import type { Order, OrderItem } from "@prisma/client";
import { formatWhen, waLink } from "@/lib/format";
import { getPublicConfig } from "@/lib/config";

const steps = [
  { id: "pending", label: "Order received", detail: "We have your order. We will check it shortly." },
  { id: "confirmed", label: "Confirmed", detail: "We have accepted the order and started work on it." },
  { id: "stitching", label: "", detail: "" },
  { id: "dispatched", label: "Dispatched", detail: "Your parcel is on the way." },
  { id: "delivered", label: "Delivered", detail: "Your order has been delivered." },
];

export function OrderProgress({ order }: { order: Order & { items: OrderItem[] } }) {
  const config = getPublicConfig();
  const custom = order.items.some((item) => item.kind === "custom");
  const labelled = steps.map((step) =>
    step.id === "stitching"
      ? {
          ...step,
          label: custom ? "Stitching" : "In process",
          detail: custom
            ? "Your suit is being stitched to your measurements."
            : "Your ready-made order is being prepared for dispatch.",
        }
      : step,
  );
  const whatsapp = waLink(config.whatsappNumber, `Assalam o Alaikum Noorandaaz, I am asking about order ${order.orderNumber}.`);
  const current = labelled.find((step) => step.id === order.status);

  if (order.status === "cancelled") {
    return (
      <div className="mt-6 border border-neutral-300 bg-white px-4 py-5">
        <p className="font-serif text-2xl">This order was cancelled</p>
        <p className="mt-2 text-sm leading-6 text-neutral-700">If this is a surprise, message us on WhatsApp with your order number and we will check it.</p>
        <p className="mt-2 text-sm text-neutral-500">Last update {formatWhen(order.updatedAt)}</p>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-12 items-center border border-neutral-950 px-5 text-sm">
          Message us on WhatsApp
        </a>
      </div>
    );
  }

  const active = labelled.findIndex((step) => step.id === order.status);

  return (
    <div className="mt-6">
      <p className="text-sm text-neutral-600">Last update {formatWhen(order.updatedAt)}</p>
      {current ? <p className="mt-2 text-sm leading-6">{current.detail}</p> : null}
      <ol className="mt-4 grid gap-3 sm:grid-cols-5">
        {labelled.map((step, index) => {
          const done = active >= 0 && index <= active;
          const here = index === active;
          return (
            <li key={step.id} className={done ? "text-[#1c1917]" : "text-neutral-400"}>
              <span className="mb-2 block h-1" style={{ backgroundColor: done ? (here ? "#B8893B" : "#1C1917") : "#e7e2da" }} />
              <p className="text-sm font-medium">{step.label}</p>
              <p className="mt-1 text-xs leading-5">{done ? step.detail : "Not yet"}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
