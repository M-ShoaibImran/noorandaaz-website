import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { getPublicConfig } from "@/lib/config";
import { productLabel } from "@/lib/format";
import { getProduct, listProducts } from "@/lib/products";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Piece" };
  return {
    title: productLabel(product),
    description: product.description,
    openGraph: { images: product.images[0] ? [product.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const { products } = await listProducts();
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
  const config = getPublicConfig();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productLabel(product),
    description: product.description,
    image: product.images.map((src) => `${config.siteUrl}${src}`),
    brand: { "@type": "Brand", name: "Noorandaaz" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-1 px-4 pt-4 text-xs text-neutral-500">
        <Link href="/shop">Shop</Link> / <Link href={`/shop?category=${product.category}`}>{product.categoryName}</Link> / {product.collection}
      </div>
      <ProductPurchase product={product} />
      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-5 font-serif text-3xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4">
            {related.map((item) => <ProductCard key={item.id} product={item} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}
