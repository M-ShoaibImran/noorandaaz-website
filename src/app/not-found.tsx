import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <span className="mx-auto mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <p className="mt-3 text-sm leading-6 text-neutral-600">That link does not match a page in the shop. Try the shop, or go back home.</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/shop" className="inline-flex h-12 items-center bg-neutral-950 px-5 text-sm text-white">Shop</Link>
        <Link href="/" className="inline-flex h-12 items-center border border-neutral-950 px-5 text-sm">Home</Link>
      </div>
    </div>
  );
}
