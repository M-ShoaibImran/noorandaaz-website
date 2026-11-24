import type { Metadata } from "next";
import { Fraunces, Noto_Nastaliq_Urdu, Outfit } from "next/font/google";
import { connection } from "next/server";
import { Providers } from "@/components/providers";
import { Shell } from "@/components/shell";
import { getPublicConfig } from "@/lib/config";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], weight: "400", variable: "--font-nastaliq" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3847"),
  title: {
    default: "Noorandaaz | Ready to wear and custom stitching",
    template: "%s · Noorandaaz",
  },
  description:
    "Noorandaaz sells Pakistani women's ready-to-wear and custom stitching. Shalwar kameez, kurtas, lawn, chiffon, formal, and bridal. Cash on delivery anywhere in Pakistan.",
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Noorandaaz",
    images: [{ url: "/images/hero-campaign.jpg", width: 1200, height: 675, alt: "Noorandaaz campaign" }],
  },
  twitter: { card: "summary_large_image" },
  other: {
    "supported-color-schemes": "light",
  },
};

export const viewport = {
  themeColor: "#FBF8F3",
  colorScheme: "only light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const config = getPublicConfig();
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} ${nastaliq.variable} h-full antialiased`}
      style={{ colorScheme: "only light", backgroundColor: "#FBF8F3", color: "#1C1917" }}
    >
      <head>
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="theme-color" content="#FBF8F3" />
      </head>
      <body className="flex min-h-full flex-col" style={{ backgroundColor: "#FBF8F3", color: "#1C1917" }}>
        <Providers config={config}>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
