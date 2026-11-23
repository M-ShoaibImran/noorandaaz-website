"use client";

import { useState } from "react";
import Link from "next/link";
import { CITIES } from "@/lib/cities";
import { formatPrice, shippingFee } from "@/lib/format";
import { isPakistaniMobile } from "@/lib/phone";
import { useCart, useConfig } from "@/components/providers";

const methods = [
  { id: "cod", label: "Cash on delivery", detail: "Pay the rider when the parcel arrives." },
  { id: "jazzcash", label: "JazzCash", detail: "Transfer the total, then enter the transaction ID." },
  { id: "easypaisa", label: "Easypaisa", detail: "Transfer the total, then enter the transaction ID." },
  { id: "bank", label: "Bank transfer", detail: "Transfer to the account below and enter your reference." },
] as const;

export function CheckoutForm() {
  const config = useConfig();
  const { items, ready, subtotal, clear } = useCart();
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("cod");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState("");
  const fee = shippingFee(subtotal, config.deliveryFee, config.freeDeliveryThreshold);
  const total = subtotal + fee;

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") || "");
    const email = String(form.get("email") || "").trim();
    if (!isPakistaniMobile(phone)) {
      setError("Enter a Pakistani mobile number, like 03001234567.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email, or leave it blank.");
      return;
    }
    if (method !== "cod" && String(form.get("paymentRef") || "").trim().length < 4) {
      setError("Enter the transaction ID or transfer reference.");
      return;
    }
    const payload = {
      customerName: String(form.get("customerName") || ""),
      phone,
      email,
      address: String(form.get("address") || ""),
      city: String(form.get("city") || ""),
      deliveryNotes: String(form.get("deliveryNotes") || ""),
      paymentMethod: method,
      paymentRef: String(form.get("paymentRef") || ""),
      items: items.map((item) => ({
        kind: item.kind,
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        custom: item.custom,
      })),
    };
    const body = new FormData();
    body.set("payload", JSON.stringify(payload));
    const proof = form.get("proof");
    if (proof instanceof File && proof.size > 0) body.set("proof", proof);
    setPending(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", body });
      const data = (await response.json()) as { orderNumber?: string; error?: string };
      if (!response.ok || !data.orderNumber) throw new Error(data.error || "Could not place the order.");
      clear();
      window.location.assign(`/order/${data.orderNumber}`);
    } catch (submitError) {
      setPending(false);
      setError(submitError instanceof Error ? submitError.message : "Could not place the order.");
    }
  }

  if (!ready) return <p className="px-4 py-16 text-center">Preparing checkout…</p>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-serif text-4xl">Nothing to check out</h1>
        <Link href="/shop" className="mt-6 inline-flex h-12 items-center bg-neutral-950 px-5 text-sm text-white">Return to shop</Link>
      </div>
    );
  }

  const account = method === "jazzcash"
    ? { title: config.jazzcashTitle, number: config.jazzcashNumber, extra: "" }
    : method === "easypaisa"
      ? { title: config.easypaisaTitle, number: config.easypaisaNumber, extra: "" }
      : method === "bank"
        ? { title: config.bankTitle, number: config.bankAccount, extra: `${config.bankName} · IBAN ${config.bankIban}` }
        : null;

  return (
    <form onSubmit={onSubmit} className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-4xl">Checkout</h1>
          <p className="mt-2 text-sm text-neutral-600">Delivery is within Pakistan only.</p>
        </div>
        {error ? <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        {config.paymentsArePlaceholders ? (
          <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm">Payment accounts shown below are sample placeholders. Replace them in the environment file before taking real payments.</p>
        ) : null}
        <section className="grid gap-3">
          <h2 className="font-sans text-sm tracking-[0.14em] uppercase">Your details</h2>
          <input required name="customerName" autoComplete="name" placeholder="Full name" className="h-12 border border-neutral-300 px-3 text-base" />
          <input required name="phone" autoComplete="tel" inputMode="tel" placeholder="Mobile, 03XXXXXXXXX" className="h-12 border border-neutral-300 px-3 text-base" />
          <input name="email" autoComplete="email" placeholder="Email, optional" className="h-12 border border-neutral-300 px-3 text-base" />
        </section>
        <section className="grid gap-3">
          <h2 className="font-sans text-sm tracking-[0.14em] uppercase">Delivery</h2>
          <textarea required name="address" autoComplete="street-address" rows={3} placeholder="House, street, area" className="border border-neutral-300 p-3 text-base" />
          <select required name="city" defaultValue="" className="h-12 border border-neutral-300 bg-white px-3 text-base">
            <option value="" disabled>City</option>
            {CITIES.map((city) => <option key={city}>{city}</option>)}
          </select>
          <textarea name="deliveryNotes" rows={2} placeholder="Landmark or delivery notes, optional" className="border border-neutral-300 p-3 text-base" />
        </section>
        <section className="space-y-3">
          <h2 className="font-sans text-sm tracking-[0.14em] uppercase">Payment</h2>
          {methods.map((option) => (
            <label key={option.id} className={`block border p-4 ${method === option.id ? "border-black" : "border-neutral-300"}`}>
              <span className="flex items-start gap-3">
                <input type="radio" name="method" checked={method === option.id} onChange={() => setMethod(option.id)} className="mt-1" />
                <span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="text-sm text-neutral-500">{option.detail}</span>
                </span>
              </span>
            </label>
          ))}
          {account ? (
            <div className="bg-neutral-50 p-4 text-sm">
              <p className="font-medium">{account.title}</p>
              <p className="mt-1">{account.number}</p>
              {account.extra ? <p className="mt-1 text-neutral-600">{account.extra}</p> : null}
              <button type="button" onClick={() => copy(account.number)} className="mt-3 underline">{copied === account.number ? "Copied" : "Copy number"}</button>
              <label className="mt-4 block">
                Transaction ID / reference
                <input name="paymentRef" className="mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base" />
              </label>
              <label className="mt-3 block">
                Screenshot, optional
                <input name="proof" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm" />
              </label>
            </div>
          ) : null}
        </section>
      </div>
      <aside className="h-fit border border-neutral-200 p-5 lg:sticky lg:top-28">
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-sm"><span>Delivery</span><span>{fee === 0 ? "Free" : formatPrice(fee)}</span></p>
        <p className="mt-2 flex justify-between font-medium"><span>Total</span><span>{formatPrice(total)}</span></p>
        <button type="submit" disabled={pending} className="mt-5 h-12 w-full bg-neutral-950 text-sm text-white disabled:opacity-50">
          {pending ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
