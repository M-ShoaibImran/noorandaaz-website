import Image from "next/image";
import Link from "next/link";
import { formatPrice, productLabel } from "@/lib/format";
import type { StoreProduct } from "@/lib/products";

export function ProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  return (
    <article>
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
          {image ? (
            <Image
              src={image}
              alt={productLabel(product)}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
          {product.isNew ? (
            <span className="absolute top-2 left-2 bg-white px-2 py-1 text-[10px] tracking-[0.14em] uppercase">New</span>
          ) : null}
        </div>
        <div className="pt-3">
          <h3 className="font-sans text-sm font-medium tracking-normal">{product.name}</h3>
          <p className="mt-1 text-xs text-neutral-500">
            {product.collection} · {product.categoryName}
            {product.isSample ? " · Sample" : ""}
          </p>
          <p className="mt-1 text-sm">
            {formatPrice(product.price)}
            {product.compareAt && product.compareAt > product.price ? (
              <span className="ml-2 text-neutral-400 line-through">{formatPrice(product.compareAt)}</span>
            ) : null}
          </p>
        </div>
      </Link>
    </article>
  );
}
