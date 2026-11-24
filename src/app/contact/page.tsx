import type { Metadata } from "next";
import { getPublicConfig } from "@/lib/config";
import { waLink } from "@/lib/format";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const config = getPublicConfig();
  const whatsapp = waLink(config.whatsappNumber, "Assalam o Alaikum Noorandaaz, I would like to ask about an order.");
  return (
    <article className="mx-auto max-w-xl px-4 py-14">
      <h1 className="font-serif text-4xl">Contact</h1>
      <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <p className="mt-4 text-sm leading-7 text-neutral-700">WhatsApp is the fastest way to reach the atelier. For a studio visit in Lahore, message us and we will set a time.</p>
      <p className="mt-6 text-xs tracking-[0.14em] text-neutral-500 uppercase">WhatsApp</p>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-2 flex h-12 items-center justify-center bg-neutral-950 text-sm text-white">
        Message {config.whatsappDisplay}
      </a>
      <p className="mt-6 text-xs tracking-[0.14em] text-neutral-500 uppercase">Email</p>
      <p className="mt-2 text-sm"><a className="underline" href={`mailto:${config.contactEmail}`}>{config.contactEmail}</a></p>
      <p className="mt-6 text-xs tracking-[0.14em] text-neutral-500 uppercase">Hours</p>
      <p className="mt-2 text-sm text-neutral-600">Monday to Saturday, 11:00–19:00 PKT. We deliver across Pakistan and do not ship outside the country.</p>
    </article>
  );
}
