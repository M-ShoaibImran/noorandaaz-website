import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();
  const sizes = JSON.parse(product.sizes) as string[];
  const images = JSON.parse(product.images) as string[];
  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl">Edit piece</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          collection: product.collection,
          slug: product.slug,
          description: product.description,
          details: product.details,
          price: product.price,
          compareAt: product.compareAt,
          category: product.category,
          fabric: product.fabric,
          sizes,
          images,
          featured: product.featured,
          isNew: product.isNew,
          inStock: product.inStock,
          isSample: product.isSample,
        }}
      />
    </div>
  );
}
