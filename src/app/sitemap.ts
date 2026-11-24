import type { MetadataRoute } from "next";
import { getPublicConfig } from "@/lib/config";
import { listProducts } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicConfig().siteUrl;
  const paths = ["", "/shop", "/custom", "/about", "/contact", "/size-guide", "/delivery", "/faq", "/track"];
  const staticRoutes = paths.map((path) => ({
    url: `${base}${path || "/"}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
  try {
    const { products } = await listProducts();
    return [
      ...staticRoutes,
      ...products.map((product) => ({
        url: `${base}/product/${product.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
