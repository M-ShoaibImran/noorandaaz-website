import Image from "next/image";
import Link from "next/link";
import { formatPrice, productLabel } from "@/lib/format";
import type { StoreProduct } from "@/lib/products";

export function ProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  return (
    <article>
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-wheat/40">
          {image ? (
            <Image
              src={image}
              alt={productLabel(product)}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : null}
          {product.isNew ? (
            <span className="absolute top-3 left-3 bg-ivory/95 px-2 py-1 text-[10px] tracking-[0.16em] text-espresso uppercase">New</span>
          ) : null}
        </div>
        <div className="pt-3">
          <h3 className="font-sans text-sm font-medium tracking-normal text-espresso">{product.name}</h3>
          <p className="mt-1 text-xs text-ink/70">
            {product.collection}
            {product.isSample ? " · Sample" : ""}
          </p>
          <p className="mt-1.5 text-sm text-espresso">
            {formatPrice(product.price)}
            {product.compareAt && product.compareAt > product.price ? (
              <span className="ml-2 text-ink/40 line-through">{formatPrice(product.compareAt)}</span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
