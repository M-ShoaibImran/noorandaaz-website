import { cache } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { categoryName, slugify } from "@/lib/catalog";
import { safeImage } from "@/lib/format";

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  collection: string;
  description: string;
  details: string;
  price: number;
  compareAt: number | null;
  category: string;
  categoryName: string;
  fabric: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  isSample: boolean;
};

function asStrings(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function toStoreProduct(row: {
  id: string;
  slug: string;
  name: string;
  collection: string;
  description: string;
  details: string;
  price: number;
  compareAt: number | null;
  category: string;
  fabric: string;
  sizes: string;
  images: string;
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  isSample: boolean;
}): StoreProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    collection: row.collection,
    description: row.description,
    details: row.details,
    price: row.price,
    compareAt: row.compareAt,
    category: row.category,
    categoryName: categoryName(row.category),
    fabric: row.fabric,
    sizes: asStrings(row.sizes),
    images: asStrings(row.images).map((src) => safeImage(src)).filter((src): src is string => Boolean(src)),
    featured: row.featured,
    isNew: row.isNew,
    inStock: row.inStock,
    isSample: row.isSample,
  };
}

export const listProducts = cache(async () => {
  await connection();
  try {
    const rows = await db.product.findMany({ orderBy: { createdAt: "desc" } });
    return { products: rows.map(toStoreProduct), error: "" };
  } catch (error) {
    console.error(error);
    return {
      products: [] as StoreProduct[],
      error: "The catalogue is not ready. From the project folder run npm run setup, then refresh.",
    };
  }
});

export const getProduct = cache(async (slug: string) => {
  await connection();
  const row = await db.product.findUnique({ where: { slug } });
  return row ? toStoreProduct(row) : null;
});

export type ShopQuery = {
  q?: string;
  category?: string;
  fabric?: string;
  size?: string;
  min?: number;
  max?: number;
  sort?: string;
};

export function filterProducts(products: StoreProduct[], query: ShopQuery) {
  const filtered = products.filter((product) => {
    if (query.category && product.category !== query.category) return false;
    if (query.fabric && product.fabric !== query.fabric) return false;
    if (query.size && !product.sizes.includes(query.size)) return false;
    if (query.min != null && product.price < query.min) return false;
    if (query.max != null && product.price > query.max) return false;
    if (query.q) {
      const haystack = `${product.name} ${product.collection} ${product.fabric} ${product.categoryName} ${product.description}`.toLowerCase();
      if (!haystack.includes(query.q.toLowerCase())) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (query.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (query.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (query.sort === "new") sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
  else if (query.sort === "featured") sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  return sorted;
}

export async function uniqueSlug(base: string, currentId?: string) {
  const root = slugify(base) || "piece";
  let slug = root;
  let n = 2;
  while (true) {
    const found = await db.product.findUnique({ where: { slug } });
    if (!found || found.id === currentId) return slug;
    slug = `${root}-${n++}`;
  }
}
