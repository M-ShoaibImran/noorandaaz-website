"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <span className="mx-auto mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <p className="mt-3 text-sm leading-6 text-neutral-600">Please try again. If it keeps happening, message us on WhatsApp from the contact page.</p>
      <button type="button" onClick={() => reset()} className="mt-6 h-12 bg-neutral-950 px-5 text-sm text-white">Try again</button>
    </div>
  );
}
