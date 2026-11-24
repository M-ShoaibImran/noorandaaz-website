import type { Metadata } from "next";
import { Suspense } from "react";
import { FilterBar } from "@/components/filter-bar";
import { ProductCard } from "@/components/product-card";
import { filterProducts, listProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Shop", description: "Shop Noorandaaz ready-to-wear. Filter by category, fabric, size, and price in PKR." };

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const min = Number(one(params.min));
  const max = Number(one(params.max));
  const { products, error } = await listProducts();
  const visible = filterProducts(products, {
    q: one(params.q),
    category: one(params.category),
    fabric: one(params.fabric),
    size: one(params.size),
    min: Number.isFinite(min) && one(params.min) ? min : undefined,
    max: Number.isFinite(max) && one(params.max) ? max : undefined,
    sort: one(params.sort),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-4xl">Shop</h1>
      <p className="mt-2 text-sm text-neutral-600">{visible.length} {visible.length === 1 ? "piece" : "pieces"}</p>
      {error ? <p className="mt-4 text-sm">{error}</p> : null}
      <div className="mt-6">
        <Suspense fallback={<div className="h-24 bg-neutral-50" />}>
          <FilterBar />
        </Suspense>
      </div>
      {visible.length === 0 ? (
        <div className="bg-cream px-4 py-16 text-center">
          <p className="font-serif text-2xl text-espresso">Nothing matches</p>
          <p className="mt-2 text-sm text-ink/70">Try another fabric, size, or price.</p>
          <a href="/shop" className="btn-gold mt-5">Clear filters</a>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
          {visible.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
