"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CUSTOM_FABRICS, MEASUREMENT_FIELDS, emptyMeasurement, validMeasure, type Measurement } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { isPakistaniMobile, normalizePhone } from "@/lib/phone";
import { useCart } from "@/components/providers";

type DesignOption = {
  id: string;
  name: string;
  collection: string;
  image: string;
  categoryName: string;
};

type Saved = { id: string; label: string; measurements: Measurement };

const STORAGE_KEY = "noorandaaz-measures";
const steps = ["Design", "Fabric", "Measure", "Review"];

export function CustomWizard({ products, initialDesignId }: { products: DesignOption[]; initialDesignId?: string }) {
  const router = useRouter();
  const { addItem } = useCart();
  const initial = products.find((product) => product.id === initialDesignId);
  const [step, setStep] = useState(0);
  const [designType, setDesignType] = useState<"catalog" | "upload" | "describe" | "">(initial ? "catalog" : "");
  const [designProductId, setDesignProductId] = useState(initial?.id ?? "");
  const [designNotes, setDesignNotes] = useState("");
  const [referenceImage, setReferenceImage] = useState("");
  const [preview, setPreview] = useState(initial?.image ?? "");
  const [fabricId, setFabricId] = useState("");
  const [measurements, setMeasurements] = useState<Measurement>(emptyMeasurement());
  const [saved, setSaved] = useState<Saved[]>([]);
  const [label, setLabel] = useState("My measurements");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Saved[]) : [];
      if (Array.isArray(parsed)) setSaved(parsed);
    } catch {
      setSaved([]);
    }
  }, []);

  const fabric = CUSTOM_FABRICS.find((option) => option.id === fabricId);
  const design = products.find((product) => product.id === designProductId);

  function setField(key: keyof Measurement, value: string) {
    setMeasurements((current) => ({ ...current, [key]: value }));
  }

  function validate(target: number) {
    if (target === 0) return true;
    if (!designType) return fail("Choose how you want to share the design.");
    if (designType === "catalog" && !designProductId) return fail("Choose a design from the shop.");
    if (designType === "upload" && !referenceImage) return fail("Upload a reference photo.");
    if (designType === "describe" && designNotes.trim().length < 12) return fail("Describe the neckline, colour, and embroidery.");
    if (target === 1) return true;
    if (!fabricId) return fail("Choose a fabric.");
    if (target === 2) return true;
    for (const field of MEASUREMENT_FIELDS) {
      if (!validMeasure(measurements[field.key])) return fail(`Enter ${field.label.toLowerCase()} in inches.`);
    }
    return true;
  }

  function fail(text: string) {
    setError(text);
    return false;
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body });
      const data = (await response.json()) as { path?: string; error?: string };
      if (!response.ok || !data.path) throw new Error(data.error || "Upload failed");
      setReferenceImage(data.path);
      setPreview(data.path);
      setDesignType("upload");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function rememberLocal(entry: Saved) {
    const next = [entry, ...saved.filter((item) => item.id !== entry.id)].slice(0, 8);
    setSaved(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function saveMeasurements() {
    setError("");
    for (const field of MEASUREMENT_FIELDS) {
      if (!validMeasure(measurements[field.key])) {
        setError(`Enter ${field.label.toLowerCase()} before saving.`);
        return;
      }
    }
    const entry = { id: crypto.randomUUID(), label: label.trim() || "My measurements", measurements };
    rememberLocal(entry);
    setMessage("Saved on this phone.");
    if (!phone.trim()) return;
    if (!isPakistaniMobile(phone)) {
      setError("To save them to your number, enter a mobile like 03001234567.");
      return;
    }
    const response = await fetch("/api/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, label: entry.label, measurements }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) setError(data.error || "Could not save to your number.");
    else setMessage("Saved on this phone and to your mobile number.");
  }

  async function loadByPhone() {
    setError("");
    if (!isPakistaniMobile(phone)) {
      setError("Enter the mobile number you used when saving.");
      return;
    }
    const response = await fetch(`/api/measurements?phone=${normalizePhone(phone)}`);
    const data = (await response.json()) as { profiles?: Array<{ id: string; label: string } & Measurement>; error?: string };
    if (!response.ok || !data.profiles?.length) {
      setError(data.error || "No saved measurements for that number yet.");
      return;
    }
    const loaded = data.profiles.map((profile) => ({
      id: profile.id,
      label: profile.label,
      measurements: {
        shirtLength: profile.shirtLength,
        chest: profile.chest,
        waist: profile.waist,
        hips: profile.hips,
        shoulder: profile.shoulder,
        sleeveLength: profile.sleeveLength,
        armhole: profile.armhole,
        trouserLength: profile.trouserLength,
        trouserBottom: profile.trouserBottom,
        neckDepth: profile.neckDepth,
        notes: profile.notes || "",
      },
    }));
    setSaved(loaded);
    setMeasurements(loaded[0].measurements);
    setMessage(`Loaded ${loaded[0].label}.`);
  }

  function add(goToCheckout: boolean) {
    if (!validate(3) || !fabric) return;
    const name = designType === "catalog" && design
      ? `Custom · ${design.collection} ${design.name}`
      : designType === "upload"
        ? "Custom · your reference photo"
        : "Custom · described design";
    addItem({
      id: crypto.randomUUID(),
      kind: "custom",
      name,
      price: fabric.price,
      quantity: 1,
      fabric: fabric.name,
      image: preview || design?.image,
      custom: {
        designType: designType as "catalog" | "upload" | "describe",
        designProductId: designProductId || undefined,
        designNotes,
        referenceImage: referenceImage || undefined,
        fabricId,
        measurements,
      },
    });
    if (goToCheckout) router.push("/checkout");
    else setMessage("Added to your bag. You can add another design or go to checkout.");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Custom stitching</p>
      <h1 className="mt-2 font-serif text-4xl">Stitched to you</h1>
      <p className="mt-3 text-neutral-600">Pick a design, a fabric, and your measurements. We stitch it and deliver it in Pakistan.</p>
      <ol className="mt-6 grid grid-cols-4 text-center text-xs">
        {steps.map((name, index) => (
          <li key={name} className={index === step ? "font-medium text-black" : "text-neutral-400"}>
            <span className={`mx-auto mb-1 grid size-7 place-items-center ${index === step ? "bg-black text-white" : "bg-neutral-100"}`}>{index + 1}</span>
            {name}
          </li>
        ))}
      </ol>

      {error ? <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
      {message ? <p className="mt-4 border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">{message}</p> : null}

      {step === 0 ? (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              ["catalog", "A design we make"],
              ["upload", "My reference photo"],
              ["describe", "I'll describe it"],
            ] as const).map(([id, text]) => (
              <button key={id} type="button" onClick={() => { setDesignType(id); setError(""); }} className={`h-20 border px-3 text-sm ${designType === id ? "border-black bg-black text-white" : "border-neutral-300"}`}>
                {text}
              </button>
            ))}
          </div>
          {designType === "catalog" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products.map((product) => (
                <button key={product.id} type="button" onClick={() => { setDesignProductId(product.id); setPreview(product.image); }} className={`border text-left ${designProductId === product.id ? "border-black" : "border-neutral-200"}`}>
                  <div className="relative aspect-[3/4] bg-neutral-100">
                    {product.image ? <Image src={product.image} alt="" fill sizes="160px" className="object-cover" /> : null}
                  </div>
                  <span className="block p-2 text-xs">{product.collection}<br />{product.categoryName}</span>
                </button>
              ))}
            </div>
          ) : null}
          {designType === "upload" ? (
            <label className="block border border-dashed border-neutral-400 p-6 text-sm">
              {uploading ? "Uploading…" : "Choose a JPG, PNG, or WebP under 5 MB."}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-sm" onChange={(event) => onUpload(event.target.files?.[0])} />
              {preview ? <span className="relative mt-4 block aspect-[3/4] max-w-xs"><Image src={preview} alt="Reference" fill className="object-cover" /></span> : null}
            </label>
          ) : null}
          {designType === "describe" ? (
            <textarea value={designNotes} onChange={(event) => setDesignNotes(event.target.value)} rows={6} placeholder="Neckline, sleeves, colour, embroidery, and the occasion." className="w-full border border-neutral-300 p-3 text-base" />
          ) : null}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 grid gap-3">
          {CUSTOM_FABRICS.map((option) => (
            <button key={option.id} type="button" onClick={() => setFabricId(option.id)} className={`flex items-center justify-between border p-4 text-left ${fabricId === option.id ? "border-black" : "border-neutral-300"}`}>
              <span>
                <span className="block font-medium">{option.name}</span>
                <span className="text-sm text-neutral-500">{option.note}</span>
              </span>
              <span>{formatPrice(option.price)}</span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-neutral-600">Use inches. If you measured in centimetres, say so in the notes.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {MEASUREMENT_FIELDS.map((field) => (
              <label key={field.key} className="block text-sm">
                <span className="mb-1 block">{field.label}</span>
                <input inputMode="decimal" value={measurements[field.key]} onChange={(event) => setField(field.key, event.target.value)} placeholder={field.hint} className="h-12 w-full border border-neutral-300 px-3 text-base" />
              </label>
            ))}
          </div>
          <label className="block text-sm">
            <span className="mb-1 block">Notes</span>
            <textarea value={measurements.notes} onChange={(event) => setField("notes", event.target.value)} rows={3} className="w-full border border-neutral-300 p-3 text-base" placeholder="Loose or fitted, shoulder pads, side slits…" />
          </label>
          <div className="border border-neutral-200 p-4">
            <p className="text-sm font-medium">Save these measurements</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Label, for example Myself" className="h-12 border border-neutral-300 px-3 text-base" />
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Mobile, optional" className="h-12 border border-neutral-300 px-3 text-base" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={saveMeasurements} className="h-11 bg-neutral-950 px-4 text-sm text-white">Save</button>
              <button type="button" onClick={loadByPhone} className="h-11 border border-neutral-950 px-4 text-sm">Load from my number</button>
            </div>
            {saved.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {saved.map((entry) => (
                  <button key={entry.id} type="button" onClick={() => setMeasurements(entry.measurements)} className="h-10 border px-3 text-sm">
                    {entry.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 3 && fabric ? (
        <div className="mt-6 space-y-3 border border-neutral-200 p-4 text-sm leading-6">
          <p><span className="text-neutral-500">Design. </span>{designType === "catalog" ? `${design?.collection} · ${design?.name}` : designType === "upload" ? "Your reference photo" : designNotes}</p>
          <p><span className="text-neutral-500">Fabric. </span>{fabric.name}</p>
          <p><span className="text-neutral-500">Price. </span>{formatPrice(fabric.price)}</p>
          <p><span className="text-neutral-500">Shirt / trouser. </span>{measurements.shirtLength}" / {measurements.trouserLength}"</p>
          <p className="text-neutral-500">Stitching usually takes 10–18 working days after we confirm the measurements.</p>
        </div>
      ) : null}

      <div className="sticky bottom-20 z-30 mt-6 flex gap-3 border-t border-neutral-200 bg-white py-3 lg:bottom-0">
        {step > 0 ? <button type="button" className="h-12 flex-1 border border-neutral-950" onClick={() => { setError(""); setStep((value) => value - 1); }}>Back</button> : null}
        {step < 3 ? (
          <button type="button" className="h-12 flex-1 bg-neutral-950 text-white" onClick={() => { setMessage(""); if (validate(step)) { setError(""); setStep((value) => value + 1); } }}>Continue</button>
        ) : (
          <>
            <button type="button" className="h-12 flex-1 border border-neutral-950" onClick={() => add(false)}>Add to bag</button>
            <button type="button" className="h-12 flex-1 bg-neutral-950 text-white" onClick={() => add(true)}>Checkout</button>
          </>
        )}
      </div>
    </div>
  );
}
