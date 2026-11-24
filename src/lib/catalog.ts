export const CATEGORIES = [
  { slug: "shalwar-kameez", name: "Shalwar Kameez" },
  { slug: "kurtas", name: "Kurtas" },
  { slug: "lawn", name: "Lawn" },
  { slug: "chiffon", name: "Chiffon" },
  { slug: "formal", name: "Formal" },
  { slug: "bridal", name: "Bridal & Party" },
  { slug: "unstitched", name: "Unstitched" },
  { slug: "sale", name: "Sale" },
] as const;

export const FABRICS = [
  "Lawn",
  "Chiffon",
  "Cotton",
  "Khaddar",
  "Raw Silk",
  "Organza",
  "Velvet",
  "Jacquard",
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const STATUSES = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "stitching", label: "Stitching" },
  { id: "dispatched", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on delivery" },
  { id: "jazzcash", label: "JazzCash" },
  { id: "easypaisa", label: "Easypaisa" },
  { id: "bank", label: "Bank transfer" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["id"];
export type OrderStatus = (typeof STATUSES)[number]["id"];

export const CUSTOM_FABRICS = [
  { id: "lawn", name: "Lawn", price: 2500, note: "Stitching charge for a light summer suit" },
  { id: "cotton", name: "Cotton", price: 2200, note: "Stitching charge for daily wear" },
  { id: "khaddar", name: "Khaddar", price: 2800, note: "Stitching charge for cooler months" },
  { id: "chiffon", name: "Chiffon", price: 3200, note: "Stitching charge for an evening suit" },
  { id: "raw-silk", name: "Raw silk", price: 3500, note: "Stitching charge for a formal suit" },
  { id: "organza", name: "Organza", price: 3500, note: "Stitching charge for a party suit" },
  { id: "velvet", name: "Velvet", price: 3500, note: "Stitching charge for a festive suit" },
  { id: "customer", name: "My own fabric", price: 1500, note: "Stitching only. Send the fabric after we confirm." },
] as const;

export const MEASUREMENT_FIELDS = [
  { key: "shirtLength", label: "Shirt length", hint: "Shoulder seam to hem" },
  { key: "chest", label: "Chest", hint: "Around the fullest part" },
  { key: "waist", label: "Waist", hint: "Natural waist" },
  { key: "hips", label: "Hips", hint: "Around the fullest part" },
  { key: "shoulder", label: "Shoulder", hint: "Seam to seam" },
  { key: "sleeveLength", label: "Sleeve length", hint: "Shoulder to wrist" },
  { key: "armhole", label: "Armhole", hint: "Around the armhole" },
  { key: "trouserLength", label: "Trouser length", hint: "Waist to hem" },
  { key: "trouserBottom", label: "Trouser bottom", hint: "Width of the hem" },
  { key: "neckDepth", label: "Neck depth", hint: "Front neck drop" },
] as const;

export type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]["key"];

export type Measurement = Record<MeasurementKey, string> & { notes: string };

export const SIZE_CHART = [
  { size: "XS", shirt: "36", chest: "34", waist: "28", hips: "36" },
  { size: "S", shirt: "38", chest: "36", waist: "30", hips: "38" },
  { size: "M", shirt: "40", chest: "38", waist: "32", hips: "40" },
  { size: "L", shirt: "42", chest: "40", waist: "35", hips: "43" },
  { size: "XL", shirt: "44", chest: "43", waist: "38", hips: "46" },
] as const;

export function categoryName(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? slug;
}

export function paymentLabel(id: string) {
  return PAYMENT_METHODS.find((method) => method.id === id)?.label ?? id;
}

export function statusLabel(id: string) {
  return STATUSES.find((status) => status.id === id)?.label ?? id;
}

export function emptyMeasurement(): Measurement {
  return {
    shirtLength: "",
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    sleeveLength: "",
    armhole: "",
    trouserLength: "",
    trouserBottom: "",
    neckDepth: "",
    notes: "",
  };
}

export function isMeasurement(value: unknown): value is Measurement {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return MEASUREMENT_FIELDS.every((field) => typeof record[field.key] === "string");
}

export function validMeasure(value: string) {
  const trimmed = value.trim();
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(trimmed)) return false;
  const number = Number(trimmed);
  return number > 0 && number <= 250;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
