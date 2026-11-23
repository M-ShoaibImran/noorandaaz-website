"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, FABRICS, SIZES } from "@/lib/catalog";

export function FilterBar() {
  const params = useSearchParams();
  const router = useRouter();
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const [q, setQ] = useState(params.get("q") ?? "");

  function push(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  }

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    push(next);
  }

  function applyPrice(event: React.FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (q.trim()) next.set("q", q.trim());
    else next.delete("q");
    if (min) next.set("min", min);
    else next.delete("min");
    if (max) next.set("max", max);
    else next.delete("max");
    push(next);
  }

  const category = params.get("category") ?? "";
  const selectClass = "h-11 border border-neutral-300 bg-white px-3 text-sm";

  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button type="button" onClick={() => update("category", "")} className={`h-10 shrink-0 border px-4 text-sm ${category === "" ? "border-black bg-black text-white" : "border-neutral-300"}`}>
          All
        </button>
        {CATEGORIES.map((item) => (
          <button key={item.slug} type="button" onClick={() => update("category", item.slug)} className={`h-10 shrink-0 border px-4 text-sm ${category === item.slug ? "border-black bg-black text-white" : "border-neutral-300"}`}>
            {item.name}
          </button>
        ))}
      </div>
      <form onSubmit={applyPrice} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search" className="h-11 border border-neutral-300 px-3 text-base lg:col-span-2" />
        <select className={selectClass} value={params.get("fabric") ?? ""} onChange={(event) => update("fabric", event.target.value)}>
          <option value="">All fabrics</option>
          {FABRICS.map((fabric) => <option key={fabric}>{fabric}</option>)}
        </select>
        <select className={selectClass} value={params.get("size") ?? ""} onChange={(event) => update("size", event.target.value)}>
          <option value="">All sizes</option>
          {SIZES.map((size) => <option key={size}>{size}</option>)}
        </select>
        <select className={selectClass} value={params.get("sort") ?? ""} onChange={(event) => update("sort", event.target.value)}>
          <option value="">Newest</option>
          <option value="new">New in first</option>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <div className="flex gap-2 lg:col-span-6">
          <input inputMode="numeric" value={min} onChange={(event) => setMin(event.target.value)} placeholder="Min Rs." className="h-11 w-full border border-neutral-300 px-3 text-base" />
          <input inputMode="numeric" value={max} onChange={(event) => setMax(event.target.value)} placeholder="Max Rs." className="h-11 w-full border border-neutral-300 px-3 text-base" />
          <button type="submit" className="h-11 shrink-0 bg-neutral-950 px-4 text-sm text-white">Apply</button>
        </div>
      </form>
    </div>
  );
}
