"use client";

import Link from "next/link";
import { waLink } from "@/lib/format";
import { useConfig } from "@/components/providers";

export function SiteFooter() {
  const config = useConfig();
  const whatsapp = waLink(config.whatsappNumber, "Assalam o Alaikum Noorandaaz, I have a question about an order.");
  return (
    <footer className="bg-espresso text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-serif text-3xl">Noorandaaz</p>
          <p className="urdu mt-1 text-wheat">{config.brandUrdu}</p>
          <p className="mt-4 max-w-xs text-sm leading-6 text-ivory/75">
            Ready-to-wear and custom stitching for women in Pakistan. Delivered to your city.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/85">
            <li><Link href="/shop" className="hover:text-white">All pieces</Link></li>
            <li><Link href="/shop?sort=new" className="hover:text-white">New arrivals</Link></li>
            <li><Link href="/custom" className="hover:text-white">Custom stitching</Link></li>
            <li><Link href="/size-guide" className="hover:text-white">Size guide</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Help</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/85">
            <li><Link href="/track" className="hover:text-white">Track an order</Link></li>
            <li><Link href="/delivery" className="hover:text-white">Delivery & returns</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-gold uppercase">Atelier</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ivory/85">
            <li><Link href="/about" className="hover:text-white">About</Link></li>
            <li><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp {config.whatsappDisplay}</a></li>
            <li><a href={`mailto:${config.contactEmail}`} className="hover:text-white">{config.contactEmail}</a></li>
            <li>Lahore · by appointment</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs tracking-wide text-ivory/60">
        Cash on delivery · JazzCash · Easypaisa · Bank transfer · Pakistan only
      </div>
    </footer>
  );
}
