import { z } from "zod";
import { CATEGORIES, SIZES } from "@/lib/catalog";
import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/products";
import { isManagedImage } from "@/lib/uploads";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  collection: z.string().trim().max(60).optional(),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().min(10).max(2000),
  details: z.string().trim().max(2000).optional(),
  price: z.number().int().min(100).max(500000),
  compareAt: z.number().int().min(0).max(500000).nullable().optional(),
  category: z.string(),
  fabric: z.string().trim().min(2).max(40),
  sizes: z.array(z.string()).min(1),
  images: z.array(z.string()).min(1),
  featured: z.boolean(),
  isNew: z.boolean(),
  inStock: z.boolean(),
  isSample: z.boolean(),
});

export async function productData(payload: unknown, currentId?: string) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Check the piece and try again.");
  const input = parsed.data;
  if (!CATEGORIES.some((category) => category.slug === input.category)) throw new Error("Choose a category.");
  if (input.sizes.some((size) => !SIZES.includes(size as (typeof SIZES)[number]))) throw new Error("Use sizes from XS to XL.");
  if (input.images.some((src) => !isManagedImage(src))) throw new Error("One of the photos is not a valid upload.");
  const slug = await uniqueSlug(input.slug || input.name, currentId);
  return {
    name: input.name,
    collection: input.collection || "",
    slug,
    description: input.description,
    details: input.details || "",
    price: input.price,
    compareAt: input.compareAt && input.compareAt > input.price ? input.compareAt : null,
    category: input.category,
    fabric: input.fabric,
    sizes: JSON.stringify(input.sizes),
    images: JSON.stringify(input.images),
    featured: input.featured,
    isNew: input.isNew,
    inStock: input.inStock,
    isSample: input.isSample,
  };
}

export async function requireProduct(id: string) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) throw new Error("That piece no longer exists.");
  return product;
}
