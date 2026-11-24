import { discountPercent, formatPrice } from "@/lib/format";

export function PriceTag({
  price,
  compareAt,
  quantity = 1,
}: {
  price: number;
  compareAt?: number | null;
  quantity?: number;
}) {
  const sale = discountPercent(price, compareAt) > 0;
  return (
    <span>
      <span style={sale ? { color: "#9B1C1C", fontWeight: 600 } : undefined}>{formatPrice(price * quantity)}</span>
      {sale ? (
        <span className="ml-2 text-[#8a8a8a] line-through">{formatPrice((compareAt ?? 0) * quantity)}</span>
      ) : null}
    </span>
  );
}

export function SaleBadge({ price, compareAt }: { price: number; compareAt?: number | null }) {
  const off = discountPercent(price, compareAt);
  if (!off) return null;
  return (
    <span
      className="absolute top-3 right-3 px-2 py-1 text-[11px] font-semibold tracking-wide text-white"
      style={{ backgroundColor: "#9B1C1C" }}
    >
      -{off}%
    </span>
  );
}