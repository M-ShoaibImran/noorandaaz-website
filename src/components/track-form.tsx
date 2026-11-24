"use client";

import { useEffect, useRef, useState } from "react";
import { useConfig } from "@/components/providers";
import { formatPrice, waLink } from "@/lib/format";
import { isPakistaniMobile, normalizeOrderNumber, ORDER_NOT_FOUND_MESSAGE, ORDER_NUMBER_MESSAGE, PHONE_MESSAGE } from "@/lib/phone";
import { FRIENDLY_ERROR, readJson } from "@/lib/read-json";
import { clearRecentOrders, readRecentOrders, type RecentOrder } from "@/lib/recent-orders";

export function TrackForm({ initialOrder = "", alreadyShowing = false }: { initialOrder?: string; alreadyShowing?: boolean }) {
  const config = useConfig();
  const [error, setError] = useState("");
  const [missing, setMissing] = useState(false);
  const [pending, setPending] = useState(false);
  const [ready, setReady] = useState(false);
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [orderValue, setOrderValue] = useState(initialOrder);
  const [phoneValue, setPhoneValue] = useState("");
  const started = useRef(false);
  const whatsapp = waLink(config.whatsappNumber, "Assalam o Alaikum Noorandaaz, I need help finding my order.");

  async function lookup(orderNumber: string, phone: string) {
    setPending(true);
    setError("");
    setMissing(false);
    const normalized = normalizeOrderNumber(orderNumber);
    if (!normalized) {
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
      body: JSON.stringify({ orderNumber: normalized, phone }),
    });
    const { ok, status, data } = await readJson<{ error?: string; code?: string; orderNumber?: string }>(response);
    if (!ok) {
      setPending(false);
      setMissing(data.code === "missing" || status === 404);
      setError(data.error || (status === 404 ? ORDER_NOT_FOUND_MESSAGE : FRIENDLY_ERROR));
      return;
    }
    window.location.assign(`/track?order=${encodeURIComponent(data.orderNumber || normalized)}`);
  }

  useEffect(() => {
    const saved = readRecentOrders();
    setRecent(saved);
    const requested = normalizeOrderNumber(initialOrder);
    const match = saved.find((entry) => entry.orderNumber === requested);
    const pick = match || (!requested ? saved[0] : undefined);
    if (pick) {
      setOrderValue(pick.orderNumber);
      setPhoneValue(pick.phone);
    } else if (requested) {
      setOrderValue(requested);
    }
    setReady(true);
  }, [initialOrder]);

  useEffect(() => {
    if (!ready || alreadyShowing || started.current || !initialOrder) return;
    const requested = normalizeOrderNumber(initialOrder);
    const match = recent.find((entry) => entry.orderNumber === requested);
    if (!match) return;
    started.current = true;
    void lookup(match.orderNumber, match.phone);
  }, [ready, alreadyShowing, initialOrder, recent]);

  function choose(entry: RecentOrder) {
    setOrderValue(entry.orderNumber);
    setPhoneValue(entry.phone);
    void lookup(entry.orderNumber, entry.phone);
  }

  function clearSaved() {
    clearRecentOrders();
    setRecent([]);
    setPhoneValue("");
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      <h1 className="font-serif text-4xl">Track my order</h1>
      <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      {ready && recent.length > 0 ? (
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Your recent orders</p>
            <button type="button" onClick={clearSaved} className="min-h-11 text-sm underline">Not yours? Clear</button>
          </div>
          <ul className="mt-2 space-y-2">
            {recent.map((entry) => (
              <li key={entry.orderNumber}>
                <button type="button" onClick={() => choose(entry)} className="w-full border border-[#e7e2da] bg-white px-3 py-3 text-left">
                  <span className="block text-sm font-medium">{entry.orderNumber}</span>
                  <span className="mt-1 block text-xs text-neutral-600">
                    {entry.placedAt ? new Date(entry.placedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "Recent"} · {entry.item}
                  </span>
                  <span className="mt-1 block text-sm">{formatPrice(entry.total)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : ready ? (
        <p className="mt-3 text-sm leading-6 text-neutral-600">Your order number is in the confirmation page and the WhatsApp message.</p>
      ) : null}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void lookup(orderValue, phoneValue);
        }}
        className="mt-5"
      >
        <p className="text-sm leading-6 text-neutral-600">Or enter the order number and the mobile number from checkout.</p>
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
        <label className="mt-4 block text-sm">
          Order number
          <input value={orderValue} onChange={(event) => setOrderValue(event.target.value)} autoComplete="off" placeholder="NA-AB12CD" className="mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base" />
        </label>
        <label className="mt-3 block text-sm">
          Mobile number
          <input value={phoneValue} onChange={(event) => setPhoneValue(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="0300 1234567" className="mt-1 h-12 w-full border border-neutral-300 bg-white px-3 text-base" />
        </label>
        <button disabled={pending} className="mt-3 h-12 w-full bg-neutral-950 text-sm text-white disabled:opacity-50">{pending ? "Checking…" : "Track my order"}</button>
      </form>
    </div>
  );
}
