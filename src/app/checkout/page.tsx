import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout", description: "Pay by cash on delivery, JazzCash, Easypaisa, or bank transfer. Delivery inside Pakistan." };

export default function CheckoutPage() {
  return <CheckoutForm />;
}
