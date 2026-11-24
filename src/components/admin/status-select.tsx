"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STATUSES } from "@/lib/catalog";

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, setPending] = useState(false);

  const [askCancel, setAskCancel] = useState(false);
  const [remarks, setRemarks] = useState("");

  async function save(next: string, note: string) {
    setPending(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next, remarks: note }),
    });
    setPending(false);
    setAskCancel(false);
    router.refresh();
  }

  async function onChange(next: string) {
    setValue(next);
    if (next === "cancelled") {
      setAskCancel(true);
      return;
    }
    setAskCancel(false);
    await save(next, "");
  }

  return (
    <div>
      <select aria-label="Order status" value={value === "removed" ? "pending" : value} disabled={pending || value === "removed"} onChange={(event) => onChange(event.target.value)} className="h-10 border border-neutral-300 bg-white px-2 text-sm">
        {STATUSES.filter((item) => item.id !== "removed").map((item) => (
          <option key={item.id} value={item.id}>{item.label}</option>
        ))}
      </select>
      {askCancel ? (
        <div className="mt-2 max-w-xs">
          <label className="block text-xs text-neutral-600">
            Note for the customer, optional
            <textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} rows={3} placeholder="For example, we could not match the payment" className="mt-1 w-full border border-neutral-300 bg-white p-2 text-sm" />
          </label>
          <button type="button" disabled={pending} onClick={() => save("cancelled", remarks.trim())} className="mt-2 h-10 bg-neutral-950 px-3 text-sm text-white">Save cancelled</button>
        </div>
      ) : null}
    </div>
  );
}
