"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, Ruler, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers";

const tabs = [
  { href: "/", label: "Home", icon: House, match: (path: string) => path === "/" },
  { href: "/shop", label: "Shop", icon: LayoutGrid, match: (path: string) => path.startsWith("/shop") || path.startsWith("/product") },
  { href: "/custom", label: "Stitch", icon: Ruler, match: (path: string) => path.startsWith("/custom") },
  { href: "/cart", label: "Bag", icon: ShoppingBag, match: (path: string) => path.startsWith("/cart") || path.startsWith("/checkout") },
];

export function MobileTabs() {
  const path = usePathname();
  const { count, ready } = useCart();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-neutral-200 bg-white lg:hidden">
      {tabs.map((tab) => {
        const active = tab.match(path);
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href} className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-black" : "text-neutral-500"}`}>
            <span className="relative">
              <Icon className="size-5" />
              {tab.href === "/cart" && ready && count > 0 ? (
                <span className="absolute -top-1 -right-2 bg-neutral-950 px-1 text-[9px] text-white">{count}</span>
              ) : null}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
