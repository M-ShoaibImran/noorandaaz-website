import { normalizeOrderNumber, normalizePhone } from "@/lib/phone";

const KEY = "noorandaaz-orders";
const LIMIT = 5;

export type RecentOrder = {
  orderNumber: string;
  phone: string;
  placedAt: string;
  item: string;
  total: number;
};

export function readRecentOrders(): RecentOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]") as RecentOrder[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        orderNumber: normalizeOrderNumber(entry?.orderNumber || ""),
        phone: normalizePhone(entry?.phone || ""),
        placedAt: String(entry?.placedAt || ""),
        item: String(entry?.item || "Order"),
        total: Number(entry?.total) || 0,
      }))
      .filter((entry) => entry.orderNumber && entry.phone)
      .slice(0, LIMIT);
  } catch {
    return [];
  }
}

export function saveRecentOrder(entry: RecentOrder) {
  const next = {
    orderNumber: normalizeOrderNumber(entry.orderNumber),
    phone: normalizePhone(entry.phone),
    placedAt: entry.placedAt,
    item: entry.item.trim() || "Order",
    total: entry.total,
  };
  if (!next.orderNumber || !next.phone) return;
  const saved = readRecentOrders().filter((item) => item.orderNumber !== next.orderNumber);
  window.localStorage.setItem(KEY, JSON.stringify([next, ...saved].slice(0, LIMIT)));
}

export function clearRecentOrders() {
  window.localStorage.removeItem(KEY);
}
