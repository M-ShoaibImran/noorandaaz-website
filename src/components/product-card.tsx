import Image from "next/image";
import Link from "next/link";
import { productLabel } from "@/lib/format";
import type { StoreProduct } from "@/lib/products";
import { PriceTag, SaleBadge } from "@/components/price-tag";

export function ProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  return (
    <article className="flex h-full flex-col bg-white text-[#1c1917]" style={{ backgroundColor: "#FFFFFF", color: "#1C1917" }}>
      <Link href={`/product/${product.slug}`} className="group flex h-full flex-col">
        <div className="relative aspect-[3/4] overflow-hidden bg-white">
          {image ? (
            <Image
              src={image}
              alt={productLabel(product)}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : null}
          <SaleBadge price={product.price} compareAt={product.compareAt} />
          {product.isNew ? (
            <span className="absolute top-3 left-3 bg-ivory/95 px-2 py-1 text-[10px] tracking-[0.16em] text-espresso uppercase">New</span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col pt-3">
          <h3 className="line-clamp-2 min-h-10 font-sans text-sm font-medium leading-5 tracking-normal text-espresso">{product.name}</h3>
          <p className="mt-1 text-xs text-ink/70">
            {product.collection}
            {product.isSample ? " · Sample" : ""}
          </p>
          <p className="mt-auto pt-2 text-sm font-medium text-ink">
            <PriceTag price={product.price} compareAt={product.compareAt} />
          </p>
        </div>
      </Link>
    </article>
  );
}
