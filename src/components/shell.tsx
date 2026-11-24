"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { MobileTabs } from "@/components/mobile-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useConfig } from "@/components/providers";
import { waLink } from "@/lib/format";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const admin = path.startsWith("/admin");
  const config = useConfig();
  const whatsapp = waLink(
    config.whatsappNumber,
    "Assalam o Alaikum Noorandaaz, I would like to order or ask for help.",
  );
  if (admin) return <div className="min-h-screen bg-ivory">{children}</div>;
  return (
    <>
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-ivory focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="flex-1 bg-[#fbf8f3] pb-28 text-[#1c1917] lg:pb-16" style={{ backgroundColor: "#FBF8F3", color: "#1C1917" }}>
        {children}
      </main>
      <SiteFooter />
      <MobileTabs />
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="fixed right-3 bottom-[4.75rem] z-40 inline-flex size-12 items-center justify-center bg-[#128C7E] text-white shadow-lg lg:bottom-6 lg:h-12 lg:w-auto lg:gap-2 lg:px-4"
      >
        <MessageCircle className="size-4" />
        <span className="hidden text-sm font-medium lg:inline">Order on WhatsApp</span>
      </a>
    </>
  );
}
