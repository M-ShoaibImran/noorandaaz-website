import type { Metadata } from "next";
import { TrackForm } from "@/components/track-form";

export const metadata: Metadata = { title: "Track an order", description: "Track a Noorandaaz order with your order number and mobile number." };

export default function TrackPage() {
  return <TrackForm />;
}
