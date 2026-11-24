"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FRIENDLY_ERROR, readJson } from "@/lib/read-json";

export function RemoveOrder({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function confirm() {
    const reason = remarks.trim();
    if (reason.length < 3) {
      setError("Write a short reason the customer can read.");
      return;
    }
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", remarks: reason }),
    });
    const { ok, data } = await readJson<{ error?: string }>(response);
    setPending(false);
    if (!ok) {
      setError(data.error || FRIENDLY_ERROR);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center border border-[#9b1c1c] bg-white px-4 text-sm text-[#9b1c1c]">
        Remove order
      </button>
    );
  }

  return (
    <div id="remove" className="border border-[#9b1c1c] bg-white p-4">
      <p className="text-sm font-medium text-[#1c1917]">Remove this order?</p>
      <p className="mt-1 text-sm leading-6 text-neutral-600">The order stays in your records. The customer will see the reason below when they track it.</p>
      <label className="mt-3 block text-sm">
        Reason for customer
        <textarea
          required
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          rows={4}
          placeholder="Payment screenshot not valid, or item out of stock"
          className="mt-1 w-full border border-neutral-300 bg-white p-3 text-base"
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={confirm} className="inline-flex h-11 items-center bg-[#9b1c1c] px-4 text-sm text-white disabled:opacity-50">
          {pending ? "Removing…" : "Remove order"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setError(""); }} className="inline-flex h-11 items-center border border-neutral-300 bg-white px-4 text-sm">
          Keep order
        </button>
      </div>
    </div>
  );
}

export function RestoreOrder({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function restore() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restore" }),
    });
    const { ok, data } = await readJson<{ error?: string }>(response);
    setPending(false);
    if (!ok) {
      setError(data.error || FRIENDLY_ERROR);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div>
      <button type="button" disabled={pending} onClick={restore} className="inline-flex h-11 items-center border border-neutral-950 bg-white px-4 text-sm disabled:opacity-50">
        {pending ? "Restoring…" : "Restore order"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
