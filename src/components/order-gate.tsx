"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderGate({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const phone = String(new FormData(event.currentTarget).get("phone") || "");
    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, phone }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "We couldn't find an order with those details.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Order</p>
      <h1 className="mt-2 font-serif text-4xl">{orderNumber}</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600">Enter the mobile number used at checkout to see the order.</p>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <input name="phone" required inputMode="tel" placeholder="03XXXXXXXXX" className="mt-5 h-12 w-full border border-neutral-300 px-3 text-base" />
      <button disabled={pending} className="mt-3 h-12 w-full bg-neutral-950 text-sm text-white disabled:opacity-50">
        {pending ? "Checking…" : "View order"}
      </button>
    </form>
  );
}
