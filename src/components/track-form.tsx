"use client";

import { useState } from "react";
import { useConfig } from "@/components/providers";
import { waLink } from "@/lib/format";
import { isPakistaniMobile, normalizeOrderNumber, ORDER_NOT_FOUND_MESSAGE, ORDER_NUMBER_MESSAGE, PHONE_MESSAGE } from "@/lib/phone";

export function TrackForm({ initialOrder = "" }: { initialOrder?: string }) {
  const config = useConfig();
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [pending, setPending] = useState(false);
  const whatsapp = waLink(config.whatsappNumber, "Assalam o Alaikum Noorandaaz, I need help finding my order.");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMissing(false);
    const form = new FormData(event.currentTarget);
    const orderNumber = normalizeOrderNumber(String(form.get("orderNumber") || ""));
    const phone = String(form.get("phone") || "");
    if (!orderNumber) {
      setPending(false);
      setError(ORDER_NUMBER_MESSAGE);
      return;
    }
    if (!isPakistaniMobile(phone)) {
      setPending(false);
      setError(PHONE_MESSAGE);
      return;
    }
    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = (await response.json()) as { error?: string; code?: string; orderNumber?: string };
    if (!response.ok) {
      setPending(false);
      setMissing(data.code === "missing" || response.status === 404);
      setError(data.error || ORDER_NOT_FOUND_MESSAGE);
      return;
    }
    window.location.assign(`/track?order=${encodeURIComponent(data.orderNumber || orderNumber)}`);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md px-4 pt-10">
      <h1 className="font-serif text-4xl">Track my order</h1>
      <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <p className="mt-3 text-sm leading-6 text-neutral-600">Enter the order number from your confirmation, like NA-AB12CD, and the mobile number you used at checkout.</p>
      {error ? (
        <div className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <p>{error}</p>
          {missing ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-11 items-center border border-neutral-950 bg-white px-4 text-sm text-[#1c1917]">
              WhatsApp us
            </a>
          ) : null}
        </div>
      ) : null}
      <label className="mt-5 block text-sm">
        Order number
        <input name="orderNumber" defaultValue={initialOrder} autoComplete="off" placeholder="NA-AB12CD" className="mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base" />
      </label>
      <label className="mt-3 block text-sm">
        Mobile number
        <input name="phone" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" className="mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base" />
      </label>
      <button disabled={pending} className="mt-3 h-12 w-full bg-neutral-950 text-sm text-white disabled:opacity-50">{pending ? "Checking…" : "Track my order"}</button>
    </form>
  );
}
