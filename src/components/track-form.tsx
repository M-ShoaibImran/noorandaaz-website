"use client";

import { useState } from "react";

export function TrackForm({ initialOrder = "" }: { initialOrder?: string }) {
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
    window.location.assign(`/track?order=${encodeURIComponent(orderNumber)}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md px-4 pt-10">
      <h1 className="font-serif text-4xl">Track my order</h1>
      <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <p className="mt-3 text-sm leading-6 text-neutral-600">Enter the order number from your confirmation, like NA-AB12CD, and the mobile number you used at checkout.</p>
      {error ? <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      <label className="mt-5 block text-sm">
        Order number
        <input name="orderNumber" required defaultValue={initialOrder} placeholder="NA-AB12CD" className="mt-1 h-12 w-full border border-neutral-300 px-3 text-base uppercase" />
      </label>
      <label className="mt-3 block text-sm">
        Mobile number
        <input name="phone" required inputMode="tel" placeholder="03XXXXXXXXX" className="mt-1 h-12 w-full border border-neutral-300 px-3 text-base" />
      </label>
      <button disabled={pending} className="mt-3 h-12 w-full bg-neutral-950 text-sm text-white disabled:opacity-50">{pending ? "Checking…" : "Track my order"}</button>
    </form>
  );
}
