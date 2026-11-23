import type { Measurement } from "@/lib/catalog";

export type CartCustom = {
  designType: "catalog" | "upload" | "describe";
  designProductId?: string;
  designNotes: string;
  referenceImage?: string;
  fabricId: string;
  measurements: Measurement;
};

export type CartItem = {
  id: string;
  kind: "ready" | "custom";
  productId?: string;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  fabric?: string;
  image?: string;
  custom?: CartCustom;
};
