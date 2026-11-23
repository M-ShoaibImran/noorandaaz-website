import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Pieces</h1>
        <Link href="/admin/products/new" className="inline-flex h-11 items-center bg-neutral-950 px-4 text-sm text-white">Add piece</Link>
      </div>
      <ul className="mt-6 divide-y divide-neutral-200 border border-neutral-200 bg-white">
        {products.map((product) => (
          <li key={product.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <div>
              <Link href={`/admin/products/${product.id}`} className="font-medium underline">{product.collection ? `${product.collection} · ` : ""}{product.name}</Link>
              <p className="text-neutral-500">{formatPrice(product.price)} · {product.fabric}{product.isSample ? " · Sample" : ""}{product.inStock ? "" : " · Out of stock"}</p>
            </div>
            <Link href={`/product/${product.slug}`} className="text-xs underline">View</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
