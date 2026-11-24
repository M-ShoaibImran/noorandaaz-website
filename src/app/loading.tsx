export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="h-8 w-40 animate-pulse bg-[#f3f0eb]" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse bg-[#f3f0eb]" />
        ))}
      </div>
    </div>
  );
}
