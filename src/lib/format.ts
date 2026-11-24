export function formatPrice(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (compareAt == null || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function shippingFee(subtotal: number, fee: number, threshold: number) {
  if (subtotal <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;
  return fee;
}

export function waLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function productLabel(product: { name: string; collection?: string | null }) {
  return product.collection ? `${product.collection} · ${product.name}` : product.name;
}

export function safeImage(src?: string | null) {
  if (!src || src.includes("..")) return null;
  if (src.startsWith("/images/") || src.startsWith("/uploads/")) return src;
  return null;
}

export function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
