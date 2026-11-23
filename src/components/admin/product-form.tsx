"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, FABRICS, SIZES } from "@/lib/catalog";

type Initial = {
  id?: string;
  name: string;
  collection: string;
  slug: string;
  description: string;
  details: string;
  price: number;
  compareAt: number | null;
  category: string;
  fabric: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  isSample: boolean;
};

const blank: Initial = {
  name: "",
  collection: "",
  slug: "",
  description: "",
  details: "",
  price: 0,
  compareAt: null,
  category: "lawn",
  fabric: "Lawn",
  sizes: ["XS", "S", "M", "L", "XL"],
  images: [],
  featured: false,
  isNew: true,
  inStock: true,
  isSample: false,
};

export function ProductForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState<Initial>(initial ?? blank);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function set<K extends keyof Initial>(key: K, value: Initial[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function upload(list: FileList | null) {
    if (!list?.length) return;
    setPending(true);
    setError("");
    try {
      for (const file of Array.from(list)) {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/api/admin/uploads", { method: "POST", body });
        const data = (await response.json()) as { path?: string; error?: string };
        if (!response.ok || !data.path) throw new Error(data.error || "Upload failed");
        setForm((current) => ({ ...current, images: [...current.images, data.path!] }));
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const payload = { ...form, price: Number(form.price), compareAt: form.compareAt ? Number(form.compareAt) : null };
    const response = await fetch(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not save.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  async function remove() {
    if (!form.id || !confirm("Delete this piece?")) return;
    await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  const field = "h-11 w-full border border-neutral-300 px-3 text-base";

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-3">
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <input required className={field} placeholder="Name" value={form.name} onChange={(event) => set("name", event.target.value)} />
      <input className={field} placeholder="Collection name" value={form.collection} onChange={(event) => set("collection", event.target.value)} />
      <input className={field} placeholder="Slug, optional" value={form.slug} onChange={(event) => set("slug", event.target.value)} />
      <textarea required className="min-h-28 border border-neutral-300 p-3 text-base" placeholder="Description" value={form.description} onChange={(event) => set("description", event.target.value)} />
      <textarea className="min-h-20 border border-neutral-300 p-3 text-base" placeholder="Care and what is included" value={form.details} onChange={(event) => set("details", event.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input required type="number" min={100} className={field} placeholder="Price in Rs." value={form.price || ""} onChange={(event) => set("price", Number(event.target.value))} />
        <input type="number" min={0} className={field} placeholder="Compare-at price, optional" value={form.compareAt ?? ""} onChange={(event) => set("compareAt", event.target.value ? Number(event.target.value) : null)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className={field} value={form.category} onChange={(event) => set("category", event.target.value)}>
          {CATEGORIES.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
        </select>
        <input list="fabrics" className={field} placeholder="Fabric" value={form.fabric} onChange={(event) => set("fabric", event.target.value)} />
        <datalist id="fabrics">{FABRICS.map((fabric) => <option key={fabric} value={fabric} />)}</datalist>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {SIZES.map((size) => (
          <label key={size} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.sizes.includes(size)}
              onChange={(event) => set("sizes", event.target.checked ? [...form.sizes, size] : form.sizes.filter((item) => item !== size))}
            />
            {size}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        {([
          ["featured", "Featured"],
          ["isNew", "New"],
          ["inStock", "In stock"],
          ["isSample", "Sample data"],
        ] as const).map(([key, text]) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={form[key]} onChange={(event) => set(key, event.target.checked)} />
            {text}
          </label>
        ))}
      </div>
      <label className="text-sm">
        Photos
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-1 block" onChange={(event) => upload(event.target.files)} />
      </label>
      <div className="flex flex-wrap gap-2">
        {form.images.map((src) => (
          <button type="button" key={src} onClick={() => set("images", form.images.filter((item) => item !== src))} className="relative h-24 w-16 bg-neutral-100">
            <Image src={src} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button disabled={pending} className="h-12 bg-neutral-950 px-6 text-sm text-white disabled:opacity-50">{pending ? "Saving…" : "Save piece"}</button>
        {form.id ? <button type="button" onClick={remove} className="h-12 border border-neutral-950 px-6 text-sm">Delete</button> : null}
      </div>
    </form>
  );
}
