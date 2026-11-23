import type { PublicConfig } from "@/lib/public-config";

function env(name: string, fallback: string) {
  const value = process.env[name];
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function envInt(name: string, fallback: number) {
  const parsed = Number(env(name, String(fallback)));
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

const PLACEHOLDER_IBAN = "PK00HABB0000001234567890";

export function getPublicConfig(): PublicConfig {
  const bankIban = env("NEXT_PUBLIC_BANK_IBAN", PLACEHOLDER_IBAN);
  return {
    brand: "Noorandaaz",
    brandUrdu: "نور انداز",
    siteUrl: env("NEXT_PUBLIC_SITE_URL", "http://127.0.0.1:3847").replace(/\/$/, ""),
    whatsappNumber: env("NEXT_PUBLIC_WHATSAPP_NUMBER", "923001234567"),
    whatsappDisplay: env("NEXT_PUBLIC_WHATSAPP_DISPLAY", "0300 1234567"),
    contactEmail: env("NEXT_PUBLIC_CONTACT_EMAIL", "hello@noorandaaz.pk"),
    jazzcashNumber: env("NEXT_PUBLIC_JAZZCASH_NUMBER", "0300-1234567"),
    jazzcashTitle: env("NEXT_PUBLIC_JAZZCASH_TITLE", "Noorandaaz"),
    easypaisaNumber: env("NEXT_PUBLIC_EASYPAISA_NUMBER", "0301-7654321"),
    easypaisaTitle: env("NEXT_PUBLIC_EASYPAISA_TITLE", "Noorandaaz"),
    bankName: env("NEXT_PUBLIC_BANK_NAME", "Habib Bank Limited (HBL)"),
    bankTitle: env("NEXT_PUBLIC_BANK_TITLE", "Noorandaaz"),
    bankAccount: env("NEXT_PUBLIC_BANK_ACCOUNT", "1234-5678901234"),
    bankIban,
    deliveryFee: envInt("NEXT_PUBLIC_DELIVERY_FEE", 250),
    freeDeliveryThreshold: envInt("NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD", 8000),
    paymentsArePlaceholders: bankIban === PLACEHOLDER_IBAN,
  };
}
