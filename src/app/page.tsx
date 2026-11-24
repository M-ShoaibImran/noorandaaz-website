import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/format";
import { getPublicConfig } from "@/lib/config";
import { listProducts, type StoreProduct } from "@/lib/products";

const tiles = [
  { href: "/shop?category=lawn", name: "Lawn", image: "/images/looks/neelofar-lawn.jpg" },
  { href: "/shop?category=chiffon", name: "Chiffon", image: "/images/looks/gulnar-chiffon.jpg" },
  { href: "/shop?category=formal", name: "Formal", image: "/images/looks/noor-formal.jpg" },
  { href: "/shop?category=bridal", name: "Bridal", image: "/images/looks/meher-bridal.jpg" },
  { href: "/shop?category=kurtas", name: "Kurtas", image: "/images/looks/saba-kurta.jpg" },
  { href: "/shop?category=unstitched", name: "Unstitched", image: "/images/looks/aab-e-rawan.jpg" },
];

function ProductRow({
  title,
  lede,
  href,
  products,
}: {
  title: string;
  lede: string;
  href: string;
  products: StoreProduct[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-espresso sm:text-4xl">{title}</h2>
          <p className="mt-1 max-w-md text-sm text-ink/70">{lede}</p>
        </div>
        <Link href={href} className="shrink-0 text-sm font-medium text-ink underline decoration-gold decoration-2 underline-offset-4">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const config = getPublicConfig();
  const { products, error } = await listProducts();
  const sample = products.some((product) => product.isSample);
  const by = (...slugs: string[]) => products.filter((product) => slugs.includes(product.category));

  return (
    <>
      <section className="relative min-h-[78vh] bg-espresso lg:min-h-[86vh]">
        <Image
          src="/images/hero-campaign.jpg"
          alt="Woman in an embroidered ivory suit with a gold dupatta"
          fill
          priority
          className="object-cover object-[center_20%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/72 to-black/45 lg:bg-gradient-to-r lg:from-black/88 lg:via-black/68 lg:to-black/35" />
        <div className="absolute inset-x-0 bottom-36 max-w-xl p-5 text-ivory sm:bottom-28 sm:p-10 lg:top-0 lg:bottom-auto lg:flex lg:h-full lg:flex-col lg:justify-center">
          <p className="text-xs tracking-[0.28em] text-white/80 uppercase">New arrivals</p>
          <h1 className="mt-3 font-serif text-4xl text-white sm:text-6xl">Ready to wear, cut for you.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-white sm:text-base">
            Shalwar kameez, kurtas, and occasion dresses. Standard sizes, or stitched from your measurements. Delivered anywhere in Pakistan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop?sort=new" className="btn-hero">Shop new in</Link>
            <Link href="/custom" className="btn-hero-line">Custom stitching</Link>
          </div>
        </div>
      </section>

      {sample ? (
        <p className="bg-espresso px-4 py-2 text-center text-xs text-white/80">
          Sample catalogue. Photos and prices are placeholders until you replace them in Admin.
        </p>
      ) : null}
      {error ? <p className="bg-wheat px-4 py-3 text-center text-sm text-espresso">{error}</p> : null}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-3xl text-espresso">Shop by category</h2>
          <Link href="/shop" className="text-sm font-medium text-ink underline decoration-gold decoration-2 underline-offset-4">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <Link key={tile.name} href={tile.href} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-white">
                <Image src={tile.image} alt={tile.name} fill sizes="180px" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
              </div>
              <p className="pt-2 text-center text-sm text-espresso">{tile.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <ProductRow title="New arrivals" lede="Just in this week. Ready to ship in standard sizes." href="/shop?sort=new" products={products.filter((product) => product.isNew)} />
      <ProductRow title="Ready to wear" lede="Pret suits and kurtas, stitched and ready." href="/shop?category=shalwar-kameez" products={by("shalwar-kameez", "kurtas")} />
      <ProductRow title="Unstitched" lede="Fabric sets to stitch at home, or send to our atelier." href="/shop?category=unstitched" products={by("unstitched")} />
      <ProductRow title="Lawn and summer" lede="Light lawn for warm days." href="/shop?category=lawn" products={products.filter((product) => product.category === "lawn" || product.fabric === "Lawn")} />
      <ProductRow title="Formal and bridal" lede="Evenings, baraat, and walima." href="/shop?category=bridal" products={by("formal", "bridal")} />
      <ProductRow title="Eid and festive" lede="Chiffon, velvet, and embroidered pieces for the season." href="/shop?category=chiffon" products={by("chiffon", "formal")} />

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2">
        <div className="relative min-h-72 overflow-hidden sm:min-h-96">
          <Image src="/images/custom-stitch.jpg" alt="Measuring tape and fabric on a tailoring table" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-ink uppercase">Custom stitching</p>
          <h2 className="mt-2 font-serif text-3xl text-espresso sm:text-4xl">Stitched to your measurements.</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink/80">Choose a design we already make, send a photo, or describe it. Save your measurements and reuse them next time.</p>
          <Link href="/custom" className="btn-primary mt-6">Start custom stitching</Link>
        </div>
      </section>

      <section className="border-y border-[#e7e2da] bg-white">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Cash on delivery", "Pay the rider when the parcel arrives."],
            ["All over Pakistan", `Delivery ${formatPrice(config.deliveryFee)}. Free over ${formatPrice(config.freeDeliveryThreshold)}.`],
            ["WhatsApp support", "Message us to order or ask a question."],
            ["Easy measurements", "Enter inches once. We save them for you."],
          ].map(([title, text]) => (
            <div key={title} className="px-5 py-6">
              <p className="text-sm font-medium text-espresso">{title}</p>
              <p className="mt-1 text-sm text-ink/70">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-serif text-3xl text-espresso">What customers say</h2>
        <p className="mt-2 text-sm text-ink/60">Sample notes. Replace them with words from your own clients.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["The lawn suit arrived pressed and the length matched the size chart.", "Ayesha, Karachi"],
            ["I saved my measurements. The second order used the same set.", "Maham, Lahore"],
            ["Cash on delivery made it simple to order from Multan.", "Sana, Islamabad"],
          ].map(([quote, name]) => (
            <blockquote key={name} className="border border-[#e7e2da] bg-white p-5">
              <p className="text-sm leading-6 text-ink">“{quote}”</p>
              <footer className="mt-4 text-xs tracking-wide text-ink/60 uppercase">{name} · Sample</footer>
            </blockquote>
          ))}
        </div>
      </section>
    </>
  );
}
