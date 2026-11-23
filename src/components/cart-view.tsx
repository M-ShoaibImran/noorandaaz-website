"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, shippingFee, waLink } from "@/lib/format";
import { useCart, useConfig } from "@/components/providers";

export function CartView() {
  const config = useConfig();
  const { items, ready, subtotal, setQuantity, removeItem } = useCart();
  const fee = shippingFee(subtotal, config.deliveryFee, config.freeDeliveryThreshold);
  const total = subtotal + fee;
  const remaining = config.freeDeliveryThreshold - subtotal;
  const lines = items.map((item, index) => `${index + 1}. ${item.name}${item.size ? ` · Size ${item.size}` : ""}\n${formatPrice(item.price)} × ${item.quantity}`).join("\n\n");
  const whatsapp = waLink(config.whatsappNumber, `Assalam o Alaikum Noorandaaz, I would like to place this order:\n\n${lines}\n\nEstimated total: ${formatPrice(total)}`);

  if (!ready) return <p className="px-4 py-16 text-center text-sm text-neutral-500">Opening your bag…</p>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-neutral-600">Browse ready-to-wear, or start a custom stitching order.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className="inline-flex h-12 items-center bg-neutral-950 px-5 text-sm text-white">Shop</Link>
          <Link href="/custom" className="inline-flex h-12 items-center border border-neutral-950 px-5 text-sm">Custom stitching</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div>
        <h1 className="font-serif text-4xl">Bag</h1>
        <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <div className="relative h-28 w-20 shrink-0 bg-neutral-100">
                {item.image ? <Image src={item.image} alt="" fill sizes="80px" className="object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{item.size ? `Size ${item.size}` : "Custom"}{item.fabric ? ` · ${item.fabric}` : ""}</p>
                <p className="mt-2 text-sm">{formatPrice(item.price)}</p>
                <div className="mt-3 flex items-center gap-3">
                  {item.kind === "ready" ? (
                    <>
                      <button type="button" className="size-9 border" onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label="Decrease">−</button>
                      <span className="text-sm">{item.quantity}</span>
                      <button type="button" className="size-9 border" onClick={() => setQuantity(item.id, item.quantity + 1)} aria-label="Increase">+</button>
                    </>
                  ) : <span className="text-sm text-neutral-500">Qty 1</span>}
                  <button type="button" onClick={() => removeItem(item.id)} className="text-sm underline">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="h-fit border border-neutral-200 p-5">
        <p className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></p>
        <p className="mt-2 flex justify-between text-sm"><span>Delivery</span><span>{fee === 0 ? "Free" : formatPrice(fee)}</span></p>
        <p className="mt-3 flex justify-between text-base font-medium"><span>Total</span><span>{formatPrice(total)}</span></p>
        <p className="mt-3 text-sm text-neutral-600">
          {fee === 0 ? "Delivery is free on this order." : `Add ${formatPrice(remaining)} for free delivery.`}
        </p>
        <Link href="/checkout" className="mt-5 flex h-12 items-center justify-center bg-neutral-950 text-sm text-white">Checkout</Link>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 flex h-12 items-center justify-center border border-neutral-950 text-sm">Order on WhatsApp</a>
      </aside>
    </div>
  );
}
