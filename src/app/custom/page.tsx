import type { Metadata } from "next";
import { CustomWizard } from "@/components/custom-wizard";
import { listProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Custom stitching",
  description: "Order custom stitching from Noorandaaz. Choose a design, fabric, and send your measurements.",
};

export default async function CustomPage({ searchParams }: { searchParams: Promise<{ design?: string }> }) {
  const params = await searchParams;
  const { products } = await listProducts();
  return (
    <CustomWizard
      initialDesignId={params.design}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        collection: product.collection,
        image: product.images[0] || "",
        categoryName: product.categoryName,
      }))}
    />
  );
}
