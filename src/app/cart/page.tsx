import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Bag", description: "Review your Noorandaaz bag, then check out or send the order on WhatsApp." };

export default function CartPage() {
  return <CartView />;
}
