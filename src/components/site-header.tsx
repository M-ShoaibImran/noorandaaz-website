"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { useCart, useConfig } from "@/components/providers";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/custom", label: "Custom stitching" },
  { href: "/contact", label: "Contact us" },
];

export function SiteHeader() {
  const config = useConfig();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 border-b border-[#e7e2da] bg-[#fbf8f3]" style={{ backgroundColor: "#FBF8F3", color: "#1C1917" }}>
      <p className="bg-[#1c1917] px-3 py-2 text-center text-[11px] tracking-wide text-[#fbf8f3] sm:text-xs" style={{ backgroundColor: "#1C1917", color: "#FBF8F3" }}>
        Cash on delivery across Pakistan · Free delivery over {formatPrice(config.freeDeliveryThreshold)}
      </p>
      <header>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex size-11 items-center justify-center lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%,22rem)] bg-[#fbf8f3]">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">Noorandaaz</SheetTitle>
              </SheetHeader>
              <form action="/shop" className="px-4">
                <input
                  name="q"
                  placeholder="Search the shop"
                  className="h-12 w-full border border-neutral-300 px-3 text-base"
                />
              </form>
              <nav className="mt-2 flex flex-col px-4">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-neutral-200 py-4 text-base">
                    {link.label}
                  </Link>
                ))}
                <Link href="/size-guide" onClick={() => setOpen(false)} className="border-b border-neutral-200 py-4 text-base">
                  Size guide
                </Link>
                <Link href="/track" onClick={() => setOpen(false)} className="py-4 text-base">
                  Track an order
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="min-w-0 flex-1 lg:flex-none">
            <span className="block font-serif text-2xl leading-none tracking-tight sm:text-3xl">Noorandaaz</span>
            <span className="urdu block text-sm text-neutral-500">{config.brandUrdu}</span>
          </Link>

          <form action="/shop" className="mx-auto hidden max-w-sm flex-1 lg:block">
            <label className="relative block">
              <span className="sr-only">Search</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                name="q"
                placeholder="Search the shop"
                className="h-11 w-full border border-neutral-300 pr-3 pl-10 text-sm"
              />
            </label>
          </form>

          <Link href="/cart" className="relative inline-flex size-11 items-center justify-center" aria-label="Bag">
            <ShoppingBag className="size-5" />
            {ready && count > 0 ? (
              <span className="absolute top-1 right-0 grid min-w-5 place-items-center bg-ink px-1 text-[10px] text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
        <nav className="mx-auto hidden max-w-7xl gap-6 px-4 pb-3 text-sm lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap text-ink hover:underline hover:decoration-gold hover:decoration-2 hover:underline-offset-4">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
    </div>
  );
}
