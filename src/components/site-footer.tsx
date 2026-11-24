"use client";

import Link from "next/link";
import { waLink } from "@/lib/format";
import { useConfig } from "@/components/providers";

export function SiteFooter() {
  const config = useConfig();
  const whatsapp = waLink(config.whatsappNumber, "Assalam o Alaikum Noorandaaz, I have a question about an order.");
  return (
    <footer className="bg-[#1c1917] text-[#fbf8f3]" style={{ backgroundColor: "#1C1917", color: "#FBF8F3" }}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-3xl">Noorandaaz</p>
          <p className="urdu mt-1 text-white/70">{config.brandUrdu}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-ivory/75">
            Ready-to-wear and custom stitching for women in Pakistan. Delivered to your city.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Shop</p>
          <ul className="mt-3 text-sm text-ivory/85">
            <li><Link href="/shop" className="inline-flex min-h-11 items-center transition-colors hover:text-white">All pieces</Link></li>
            <li><Link href="/shop?category=sale" className="inline-flex min-h-11 items-center transition-colors hover:text-white">Sale</Link></li>
            <li><Link href="/shop?sort=new" className="inline-flex min-h-11 items-center transition-colors hover:text-white">New arrivals</Link></li>
            <li><Link href="/custom" className="inline-flex min-h-11 items-center transition-colors hover:text-white">Custom stitching</Link></li>
            <li><Link href="/size-guide" className="inline-flex min-h-11 items-center transition-colors hover:text-white">Size guide</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Help</p>
          <ul className="mt-3 text-sm text-ivory/85">
            <li><Link href="/track" className="inline-flex min-h-11 items-center transition-colors hover:text-white">Track an order</Link></li>
            <li><Link href="/delivery" className="inline-flex min-h-11 items-center transition-colors hover:text-white">Delivery & returns</Link></li>
            <li><Link href="/faq" className="inline-flex min-h-11 items-center transition-colors hover:text-white">FAQ</Link></li>
            <li><Link href="/contact" className="inline-flex min-h-11 items-center transition-colors hover:text-white">Contact us</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Atelier</p>
          <ul className="mt-3 text-sm text-ivory/85">
            <li><Link href="/about" className="inline-flex min-h-11 items-center transition-colors hover:text-white">About</Link></li>
            <li><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-white">WhatsApp {config.whatsappDisplay}</a></li>
            <li><a href={`mailto:${config.contactEmail}`} className="inline-flex min-h-11 items-center transition-colors hover:text-white">{config.contactEmail}</a></li>
            <li>Lahore · by appointment</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5">
        <p className="text-center text-[11px] tracking-[0.16em] text-white/50 uppercase">Pay with</p>
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {["Cash on delivery", "JazzCash", "Easypaisa", "Bank transfer"].map((method) => (
            <li key={method} className="border border-white/25 px-3 py-1.5 text-xs text-white/85">{method}</li>
          ))}
        </ul>
        <p className="mt-3 text-center text-xs text-white/50">Pakistan only</p>
      </div>
    </footer>
  );
}
