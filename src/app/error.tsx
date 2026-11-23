"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">Something went wrong</h1>
      <p className="mt-3 text-neutral-600">Refresh the page. If it keeps happening, the catalogue database may need to be set up.</p>
      <button type="button" onClick={() => reset()} className="mt-6 h-12 bg-neutral-950 px-5 text-sm text-white">Try again</button>
    </div>
  );
}
