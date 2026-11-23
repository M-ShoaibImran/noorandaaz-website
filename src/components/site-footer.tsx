"use client";

import Link from "next/link";
import { waLink } from "@/lib/format";
import { useConfig } from "@/components/providers";

export function SiteFooter() {
  const config = useConfig();
  const whatsapp = waLink(config.whatsappNumber, "Assalam o Alaikum Noorandaaz, I have a question about an order.");
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl">Noorandaaz</p>
          <p className="urdu mt-1 text-neutral-500">{config.brandUrdu}</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-600">
            Ready-to-wear and custom stitching for women in Pakistan. Delivered to your city.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/shop">All pieces</Link></li>
            <li><Link href="/shop?sort=new">New in</Link></li>
            <li><Link href="/custom">Custom stitching</Link></li>
            <li><Link href="/size-guide">Size guide</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/track">Track an order</Link></li>
            <li><Link href="/delivery">Delivery & returns</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] text-neutral-500 uppercase">Atelier</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about">About</Link></li>
            <li><a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp {config.whatsappDisplay}</a></li>
            <li><a href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></li>
            <li>Lahore · by appointment</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 px-4 py-4 text-center text-xs text-neutral-500">
        Cash on delivery · JazzCash · Easypaisa · Bank transfer · Pakistan only
      </div>
    </footer>
  );
}
