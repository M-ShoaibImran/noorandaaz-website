"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "@/components/providers";
import { waLink } from "@/lib/format";
import { isPakistaniMobile, ORDER_NOT_FOUND_MESSAGE, PHONE_MESSAGE } from "@/lib/phone";

export function OrderGate({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const config = useConfig();
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [pending, setPending] = useState(false);
  const whatsapp = waLink(config.whatsappNumber, `Assalam o Alaikum Noorandaaz, I need help finding order ${orderNumber}.`);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMissing(false);
    const phone = String(new FormData(event.currentTarget).get("phone") || "");
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
    const data = (await response.json()) as { error?: string; code?: string };
    setPending(false);
    if (!response.ok) {
      setMissing(data.code === "missing" || response.status === 404);
      setError(data.error || ORDER_NOT_FOUND_MESSAGE);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md px-4 py-16">
      <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Order</p>
      <h1 className="mt-2 font-serif text-4xl">{orderNumber}</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600">Enter the mobile number used at checkout to see the order.</p>
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
      <input name="phone" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" className="mt-5 h-12 w-full border border-neutral-300 bg-white px-3 text-base" />
      <button disabled={pending} className="mt-3 h-12 w-full bg-neutral-950 text-sm text-white disabled:opacity-50">
        {pending ? "Checking…" : "View order"}
      </button>
    </form>
  );
}
