import type { Metadata } from "next";
import Link from "next/link";
import { SIZE_CHART } from "@/lib/catalog";

export const metadata: Metadata = { title: "Size guide", description: "Noorandaaz women's size chart in inches, from XS to XL." };

export default function SizeGuidePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Size guide</h1>
      <p className="mt-4 text-sm leading-7 text-neutral-700">Measurements are in inches and describe the body, not the garment. If you are between sizes, choose custom stitching. Ready-made lengths follow the shirt length below.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-300">
              {["Size", "Shirt", "Chest", "Waist", "Hips"].map((heading) => <th key={heading} className="py-3 font-medium">{heading}</th>)}
            </tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((row) => (
              <tr key={row.size} className="border-b border-neutral-200">
                <td className="py-3">{row.size}</td>
                <td>{row.shirt}</td>
                <td>{row.chest}</td>
                <td>{row.waist}</td>
                <td>{row.hips}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6 text-sm text-neutral-600">For a stitched order we also ask for shoulder, sleeve, armhole, trouser length, trouser bottom, and neck depth. <Link href="/custom" className="underline">Start a custom order.</Link></p>
    </article>
  );
}
