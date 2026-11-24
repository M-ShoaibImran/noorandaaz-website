export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8" style={{ backgroundColor: "#FBF8F3" }}>
      <div className="h-10 w-36 animate-pulse bg-[#f3f0eb]" />
      <div className="mt-3 h-px w-8 bg-[#B8893B]" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            <div className="aspect-[3/4] animate-pulse bg-[#f3f0eb]" />
            <div className="mt-3 h-4 w-3/4 animate-pulse bg-[#f3f0eb]" />
            <div className="mt-2 h-4 w-1/3 animate-pulse bg-[#f3f0eb]" />
          </div>
        ))}
      </div>
    </div>
  );
}
