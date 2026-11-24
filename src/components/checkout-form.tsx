"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImageUp } from "lucide-react";
import { CITIES } from "@/lib/cities";
import { formatPrice, shippingFee } from "@/lib/format";
import { PriceTag } from "@/components/price-tag";
import { isPakistaniMobile, normalizePhone } from "@/lib/phone";
import { saveRecentOrder } from "@/lib/recent-orders";
import { useCart, useConfig } from "@/components/providers";

const methods = [
  { id: "cod", label: "Cash on delivery", detail: "Pay the rider when the parcel arrives." },
  { id: "jazzcash", label: "JazzCash", detail: "Transfer the total, enter the transaction ID, and upload the screenshot." },
  { id: "easypaisa", label: "Easypaisa", detail: "Transfer the total, enter the transaction ID, and upload the screenshot." },
  { id: "bank", label: "Bank transfer", detail: "Transfer to the account below, enter the reference, and upload the screenshot." },
] as const;

const MAX_SCREENSHOT = 5 * 1024 * 1024;

function screenshotProblem(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const typeOk = type === "image/jpeg" || type === "image/jpg" || type === "image/png" || type === "image/webp" || /\.(jpe?g|png|webp)$/.test(name);
  if (!typeOk) return "Use a JPG, PNG, or WebP screenshot.";
  if (file.size > MAX_SCREENSHOT) return "This screenshot is too big. Use a photo under 5 MB.";
  if (file.size <= 0) return "Upload a screenshot of your payment.";
  return "";
}

export function CheckoutForm() {
  const config = useConfig();
  const { items, ready, subtotal, clear } = useCart();
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("cod");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [proofError, setProofError] = useState("");
  const proofInput = useRef<HTMLInputElement>(null);
  const fee = shippingFee(subtotal, config.deliveryFee, config.freeDeliveryThreshold);
  const total = subtotal + fee;

  useEffect(() => {
    return () => {
      if (proofUrl) URL.revokeObjectURL(proofUrl);
    };
  }, [proofUrl]);

  function clearProof() {
    setProof(null);
    setProofUrl("");
    setProofError("");
    if (proofInput.current) proofInput.current.value = "";
  }

  function chooseProof(file: File | null) {
    if (proofUrl) URL.revokeObjectURL(proofUrl);
    if (!file) {
      clearProof();
      return;
    }
    const problem = screenshotProblem(file);
    if (problem) {
      setProof(null);
      setProofUrl("");
      setProofError(problem);
      if (proofInput.current) proofInput.current.value = "";
      return;
    }
    setProof(file);
    setProofUrl(URL.createObjectURL(file));
    setProofError("");
  }

  function selectMethod(next: (typeof methods)[number]["id"]) {
    setMethod(next);
    if (next === "cod") clearProof();
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
    } catch {
      setCopied("");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") || "");
    const email = String(form.get("email") || "").trim();
    if (!isPakistaniMobile(phone)) {
      setError("Please enter a valid mobile number like 0300 1234567");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email, or leave it blank.");
      return;
    }
    if (method !== "cod" && !proof) {
      setProofError((current) => current || "Upload a screenshot of your payment.");
    }
    if (method !== "cod" && String(form.get("paymentRef") || "").trim().length < 4) {
      setError("Enter the transaction ID or transfer reference.");
      return;
    }
    if (method !== "cod" && !proof) {
      const message = proofError || "Upload a screenshot of your payment.";
      setProofError(message);
      setError(message);
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
    if (method !== "cod" && proof) body.set("proof", proof);
    setPending(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", body });
      const data = (await response.json()) as { orderNumber?: string; error?: string };
      if (!response.ok || !data.orderNumber) throw new Error(data.error || "Could not place the order.");
      const first = items[0];
      saveRecentOrder({
        orderNumber: data.orderNumber,
        phone: normalizePhone(phone),
        placedAt: new Date().toISOString(),
        item: items.length > 1 ? `${first?.name || "Order"} + ${items.length - 1} more` : first?.name || "Order",
        total,
      });
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
          <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
          <p className="mt-3 text-sm text-neutral-600">Delivery is within Pakistan only.</p>
        </div>
        {error ? <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        {config.paymentsArePlaceholders ? (
          <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm">Payment accounts shown below are sample placeholders. Replace them in the environment file before taking real payments.</p>
        ) : null}
        <section className="grid gap-3">
          <h2 className="font-sans text-sm tracking-[0.14em] uppercase">Your details</h2>
          <label className="block text-sm">
            Full name
            <input required name="customerName" autoComplete="name" placeholder="As it should appear on the parcel" className="mt-1 h-12 w-full border border-neutral-300 px-3 text-base" />
          </label>
          <label className="block text-sm">
            Mobile number
            <input required name="phone" autoComplete="tel" inputMode="tel" placeholder="03XXXXXXXXX" className="mt-1 h-12 w-full border border-neutral-300 px-3 text-base" />
          </label>
          <label className="block text-sm">
            Email, optional
            <input name="email" autoComplete="email" placeholder="For a copy of the order" className="mt-1 h-12 w-full border border-neutral-300 px-3 text-base" />
          </label>
        </section>
        <section className="grid gap-3">
          <h2 className="font-sans text-sm tracking-[0.14em] uppercase">Delivery</h2>
          <label className="block text-sm">
            Address
            <textarea required name="address" autoComplete="street-address" rows={3} placeholder="House, street, area" className="mt-1 w-full border border-neutral-300 p-3 text-base" />
          </label>
          <label className="block text-sm">
            City
            <select required name="city" defaultValue="" className="mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base">
              <option value="" disabled>Choose a city</option>
              {CITIES.map((city) => <option key={city}>{city}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            Landmark, optional
            <textarea name="deliveryNotes" rows={2} placeholder="Gate colour, nearby shop, or who will receive it" className="mt-1 w-full border border-neutral-300 p-3 text-base" />
          </label>
        </section>
        <section className="space-y-3">
          <h2 className="font-sans text-sm tracking-[0.14em] uppercase">Payment</h2>
          {methods.map((option) => (
            <label key={option.id} className={`block border p-4 ${method === option.id ? "border-black" : "border-neutral-300"}`}>
              <span className="flex items-start gap-3">
                <input type="radio" name="method" checked={method === option.id} onChange={() => selectMethod(option.id)} className="mt-1" />
                <span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="text-sm text-neutral-500">{option.detail}</span>
                </span>
              </span>
            </label>
          ))}
          {account ? (
            <div className="space-y-4 bg-neutral-50 p-4 text-sm">
              <label className="block text-sm">
                Transaction ID
                <input name="paymentRef" placeholder="From your payment confirmation" className="mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base" />
              </label>
              <div>
                <p className="text-xs tracking-[0.14em] text-neutral-500 uppercase">Pay this account</p>
                <p className="mt-1 font-medium">{account.title}</p>
                <p className="mt-1">{account.number}</p>
                {account.extra ? <p className="mt-1 text-neutral-600">{account.extra}</p> : null}
                <button type="button" onClick={() => copy(account.number)} className="mt-3 inline-flex h-11 items-center border border-neutral-950 bg-white px-4 text-sm">{copied === account.number ? "Copied" : "Copy"}</button>
              </div>
              <div>
                <input
                  ref={proofInput}
                  id="payment-proof"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => chooseProof(event.target.files?.[0] ?? null)}
                />
                {proofUrl ? (
                  <div className="border border-neutral-300 bg-white p-3">
                    {/* Preview uses a local file URL, which next/image does not serve. */}
                    <img src={proofUrl} alt="Payment screenshot preview" className="max-h-64 w-full bg-white object-contain" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => proofInput.current?.click()} className="inline-flex h-11 items-center border border-neutral-950 bg-white px-4 text-sm">Change</button>
                      <button type="button" onClick={() => clearProof()} className="inline-flex h-11 items-center border border-neutral-300 bg-white px-4 text-sm">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="payment-proof" className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed bg-white px-4 py-6 text-center ${proofError ? "border-red-700" : "border-neutral-400"}`}>
                    <ImageUp className="size-8" aria-hidden="true" />
                    <span className="text-base font-medium text-[#1c1917]">Upload payment screenshot</span>
                    <span className="max-w-sm text-sm text-neutral-600">Take a screenshot of your JazzCash/Easypaisa/bank confirmation and upload it here</span>
                    <span className="text-xs text-neutral-500">JPG, PNG, or WebP, up to 5 MB</span>
                  </label>
                )}
                {proofError ? <p className="mt-2 text-sm text-red-700">{proofError}</p> : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
      <aside className="h-fit border border-neutral-200 bg-white p-5 lg:sticky lg:top-28">
        <h2 className="text-sm tracking-[0.14em] uppercase">Your order</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>{item.name} × {item.quantity}</span>
              <span className="shrink-0 text-right"><PriceTag price={item.price} compareAt={item.compareAt} quantity={item.quantity} /></span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-sm"><span>Delivery</span><span>{fee === 0 ? "Free" : formatPrice(fee)}</span></p>
        <p className="mt-2 flex justify-between font-medium"><span>Total</span><span>{formatPrice(total)}</span></p>
        <button type="submit" disabled={pending} className="btn-gold mt-5 w-full disabled:opacity-50">
          {pending ? "Placing order…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
