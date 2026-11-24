import type { Metadata } from "next";
import { getPublicConfig } from "@/lib/config";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Delivery and returns" };

export default function DeliveryPage() {
  const config = getPublicConfig();
  return (
    <article className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-sm leading-7 text-neutral-700">
      <h1 className="font-serif text-4xl text-black">Delivery & returns</h1>
      <span className="block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <p>We deliver inside Pakistan only. The flat delivery fee is {formatPrice(config.deliveryFee)}. Orders of {formatPrice(config.freeDeliveryThreshold)} and above ship free. Remote areas can take longer than the times below.</p>
      <p>Ready-to-wear usually leaves the atelier 3–6 working days after the order is confirmed. Custom stitching takes 10–18 working days after we confirm the measurements. If you are sending your own fabric, the clock starts when the fabric reaches us.</p>
      <p>Cash on delivery is available. JazzCash, Easypaisa, and bank transfers need a transaction ID and a screenshot of the confirmation. We match both before stitching or dispatch.</p>
      <p>Ready-made pieces can be returned unworn, with tags, within 7 days of delivery. Custom stitched pieces are made for you and are only accepted back if we made an error. Message us on WhatsApp with your order number and we will tell you the next step.</p>
    </article>
  );
}
