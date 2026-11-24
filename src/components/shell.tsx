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
      <main id="content" className="flex-1 pb-24 lg:pb-0">
        {children}
      </main>
      <SiteFooter />
      <MobileTabs />
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-3 bottom-20 z-40 inline-flex h-12 items-center gap-2 bg-[#128C7E] px-4 text-sm font-medium text-white shadow-lg lg:bottom-6"
      >
        <MessageCircle className="size-4" />
        Order on WhatsApp
      </a>
    </>
  );
}
