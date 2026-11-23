import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/format";
import { getPublicConfig } from "@/lib/config";
import { listProducts } from "@/lib/products";

export default async function HomePage() {
  const config = getPublicConfig();
  const { products, error } = await listProducts();
  const newest = products.filter((product) => product.isNew).slice(0, 8);
  const featured = products.filter((product) => product.featured).slice(0, 8);
  const sample = products.some((product) => product.isSample);

  return (
    <>
      <section className="relative min-h-[72vh] bg-neutral-950 lg:min-h-[82vh]">
        <Image src="/images/hero-campaign.jpg" alt="Woman in a black outfit with a maroon and gold dupatta" fill priority className="object-cover object-[center_20%]" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-0 bottom-0 max-w-xl p-5 text-white sm:p-10 lg:top-0 lg:bottom-auto lg:flex lg:h-full lg:flex-col lg:justify-center">
          <p className="text-xs tracking-[0.28em] uppercase">New in</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-6xl">Ready to wear, cut for you.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/90 sm:text-base">
            Shalwar kameez, kurtas, and occasion dresses. Standard sizes, or stitched from your measurements. Delivered anywhere in Pakistan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop?sort=new" className="inline-flex h-12 items-center bg-white px-5 text-sm text-black">Shop new in</Link>
            <Link href="/custom" className="inline-flex h-12 items-center border border-white px-5 text-sm">Custom stitching</Link>
          </div>
        </div>
      </section>

      {sample ? (
        <p className="bg-neutral-950 px-4 py-2 text-center text-xs text-white">
          Sample catalogue. Photos and prices are placeholders until you replace them in Admin.
        </p>
      ) : null}
      {error ? <p className="bg-amber-50 px-4 py-3 text-center text-sm">{error}</p> : null}

      <section className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-xs tracking-[0.18em] text-neutral-500 uppercase">Contact us</p>
        <h2 className="mt-2 max-w-xl font-serif text-3xl sm:text-4xl">Contact us on the website to get more info</h2>
        <p className="mt-3 max-w-xl text-neutral-600">Questions about a piece, a fabric, or custom stitching? Send a message and we will reply with the details.</p>
        <Link href="/contact" className="mt-6 inline-flex h-12 items-center bg-neutral-950 px-5 text-sm text-white">Contact us</Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-serif text-3xl">New in</h2>
          <Link href="/shop?sort=new" className="text-sm underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
          {(newest.length ? newest : products.slice(0, 4)).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="relative min-h-80">
          <Image src="/images/looks/zari-chiffon.jpg" alt="Champagne chiffon suit" fill className="object-cover" sizes="50vw" />
        </div>
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
          <p className="text-xs tracking-[0.18em] uppercase">Ready to wear</p>
          <h2 className="mt-3 font-serif text-4xl">Sizes XS to XL, sent across Pakistan.</h2>
          <p className="mt-4 max-w-md text-neutral-600">Lawn, chiffon, formal, and bridal pieces in standard sizes. Cash on delivery, JazzCash, Easypaisa, or bank transfer.</p>
          <Link href="/shop" className="mt-6 inline-flex h-12 w-fit items-center bg-neutral-950 px-5 text-sm text-white">Shop the edit</Link>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:order-1">
          <p className="text-xs tracking-[0.18em] uppercase">Custom stitching</p>
          <h2 className="mt-3 font-serif text-4xl">Your measurements, saved for next time.</h2>
          <p className="mt-4 max-w-md text-neutral-600">Choose a design, send a photo, or describe it. Pick a fabric. We stitch the suit and deliver it to your city.</p>
          <Link href="/custom" className="mt-6 inline-flex h-12 w-fit items-center border border-neutral-950 px-5 text-sm">Start an order</Link>
        </div>
        <div className="relative order-1 min-h-80 lg:order-2">
          <Image src="/images/custom-stitch.jpg" alt="Measuring tape, muslin, and scissors on a tailoring table" fill className="object-cover" sizes="50vw" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="mb-5 font-serif text-3xl">Pieces we love</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="grid border-y border-neutral-200 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Cash on delivery", "Pay the rider when it arrives."],
          ["Nationwide", `Flat ${formatPrice(config.deliveryFee)}, free over ${formatPrice(config.freeDeliveryThreshold)}.`],
          ["Made to measure", "Save your measurements and reuse them."],
          ["WhatsApp", "Order from the product page or your bag."],
        ].map(([title, text]) => (
          <div key={title} className="border-neutral-200 px-5 py-6 sm:border-l">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm text-neutral-600">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-serif text-3xl">From the fitting room</h2>
        <p className="mt-2 text-sm text-neutral-500">Sample notes. Replace them with words from your own clients.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["The lawn suit arrived pressed and the length was exactly the chart.", "Ayesha, Karachi"],
            ["I sent my measurements once. The second order used the same set.", "Maham, Lahore"],
            ["Cash on delivery made it simple for my mother to order from Multan.", "Sana, Islamabad"],
          ].map(([quote, name]) => (
            <blockquote key={name} className="border border-neutral-200 p-5">
              <p className="text-sm leading-6">“{quote}”</p>
              <footer className="mt-4 text-xs tracking-wide text-neutral-500 uppercase">{name} · Sample</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
