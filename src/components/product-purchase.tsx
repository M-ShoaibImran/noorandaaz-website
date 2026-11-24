"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice, productLabel, waLink } from "@/lib/format";
import type { StoreProduct } from "@/lib/products";
import { useCart, useConfig } from "@/components/providers";

export function ProductPurchase({ product }: { product: StoreProduct }) {
  const config = useConfig();
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const images = product.images.length ? product.images : ["/images/hero-atelier.jpg"];
  const label = productLabel(product);
  const whatsapp = waLink(
    config.whatsappNumber,
    `Assalam o Alaikum Noorandaaz, I would like to order:\n${label}${size ? `\nSize: ${size}` : ""}\n${formatPrice(product.price)}\n${config.siteUrl}/product/${product.slug}`,
  );

  function add() {
    if (!product.inStock) return;
    if (!size) {
      setError("Select a size.");
      return;
    }
    setError("");
    addItem({
      id: crypto.randomUUID(),
      kind: "ready",
      productId: product.id,
      slug: product.slug,
      name: label,
      price: product.price,
      quantity,
      size,
      fabric: product.fabric,
      image: images[0],
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-2 lg:gap-12 lg:py-10">
      <div>
        <div className="relative aspect-[3/4] bg-neutral-100">
          <Image src={images[active]} alt={label} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          {images.length > 1 ? (
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {images.map((_, index) => (
                <button key={index} type="button" aria-label={`Photo ${index + 1}`} onClick={() => setActive(index)} className={`size-2 ${index === active ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex gap-2">
            {images.map((src, index) => (
              <button key={src} type="button" onClick={() => setActive(index)} className={`relative h-20 w-16 overflow-hidden border ${index === active ? "border-black" : "border-transparent"}`}>
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">{product.categoryName}</p>
        <h1 className="mt-2 font-serif text-4xl">{product.collection || product.name}</h1>
        <p className="mt-1 text-neutral-600">{product.name}</p>
        <p className="mt-4 text-lg">
          {formatPrice(product.price)}
          {product.compareAt && product.compareAt > product.price ? (
            <span className="ml-2 text-base text-neutral-400 line-through">{formatPrice(product.compareAt)}</span>
          ) : null}
        </p>
        <p className="mt-2 text-sm text-neutral-500">{product.fabric}{product.isSample ? " · Sample piece" : ""}</p>
        <p className="mt-5 leading-7 text-neutral-700">{product.description}</p>
        {product.details ? <p className="mt-3 text-sm leading-6 text-neutral-500">{product.details}</p> : null}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-[0.14em] uppercase">Size</p>
            <Link href="/size-guide" className="text-sm underline underline-offset-4">Size guide</Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { setSize(option); setError(""); }}
                className={`h-12 min-w-12 border px-3 text-sm ${size === option ? "border-black bg-black text-white" : "border-neutral-300"}`}
              >
                {option}
              </button>
            ))}
          </div>
          {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <p className="text-xs tracking-[0.14em] uppercase">Qty</p>
          <button type="button" className="size-10 border" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
          <span className="w-6 text-center">{quantity}</span>
          <button type="button" className="size-10 border" onClick={() => setQuantity((value) => Math.min(5, value + 1))} aria-label="Increase quantity">+</button>
        </div>

        <button type="button" onClick={add} disabled={!product.inStock} className="btn-gold mt-6 w-full disabled:opacity-40">
          {product.inStock ? "Add to bag" : "Out of stock"}
        </button>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 flex h-12 w-full items-center justify-center border border-neutral-950 text-sm font-medium">
          Order on WhatsApp
        </a>
        <p className="mt-4 text-sm text-neutral-500">
          Ready-to-wear ships in 3–6 working days. <Link href={`/custom?design=${product.id}`} className="underline">Stitch this design to your measurements.</Link>
        </p>
      </div>
    </div>
  );
}
