import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Page not found</h1>
      <p className="mt-3 text-neutral-600">That link does not match anything in the shop.</p>
      <Link href="/shop" className="mt-6 inline-flex h-12 items-center bg-neutral-950 px-5 text-sm text-white">Back to shop</Link>
    </div>
  );
}
