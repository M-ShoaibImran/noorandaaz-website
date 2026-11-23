import type { MetadataRoute } from "next";
import { getPublicConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicConfig().siteUrl;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
