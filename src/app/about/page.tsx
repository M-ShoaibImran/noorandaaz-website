import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "About", description: "Noorandaaz is a new Pakistani women's clothing house for ready-to-wear and custom stitching." };

export default function AboutPage() {
  return (
    <article className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-2">
      <div className="relative min-h-80">
        <Image src="/images/hero-atelier.jpg" alt="Folded embroidered fabrics and brass scissors" fill className="object-cover" />
      </div>
      <div>
        <p className="urdu text-2xl text-neutral-500">نور انداز</p>
        <h1 className="mt-2 font-serif text-4xl">A house for clothes that fit.</h1>
        <div className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
          <p>Noorandaaz is a new women's clothing house. We sell ready-made shalwar kameez, kurtas, lawn, chiffon, formal dresses, and bridal wear in standard sizes.</p>
          <p>If a size chart is not enough, we stitch the same kind of clothes to your measurements. You can save those measurements and reuse them on the next order.</p>
          <p>Delivery is inside Pakistan only. Studio visits in Lahore are by appointment on WhatsApp. The pieces currently in the shop are sample data so the atelier can be tried before the real catalogue goes in.</p>
        </div>
      </div>
    </article>
  );
}
