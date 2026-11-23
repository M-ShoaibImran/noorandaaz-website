"use client";

import { useState } from "react";

export function TrackForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const orderNumber = String(form.get("orderNumber") || "").trim().toUpperCase();
    const phone = String(form.get("phone") || "");
    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setPending(false);
      setError(data.error || "We couldn't find an order with those details.");
      return;
    }
    window.location.assign(`/order/${orderNumber}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md px-4 py-14">
      <h1 className="font-serif text-4xl">Track an order</h1>
      <p className="mt-3 text-sm text-neutral-600">Use the order number from your confirmation and the mobile number on the order.</p>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <input name="orderNumber" required placeholder="Order number, NA-XXXXXX" className="mt-5 h-12 w-full border border-neutral-300 px-3 text-base uppercase" />
      <input name="phone" required inputMode="tel" placeholder="Mobile number" className="mt-3 h-12 w-full border border-neutral-300 px-3 text-base" />
      <button disabled={pending} className="mt-3 h-12 w-full bg-neutral-950 text-sm text-white disabled:opacity-50">{pending ? "Checking…" : "Track"}</button>
    </form>
  );
}
