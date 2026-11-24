import { jsonError, tooLarge } from "@/lib/api-error";
import { assertSameOrigin } from "@/lib/auth";
import { placeOrder } from "@/lib/place-order";
import { saveImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const oversized = tooLarge(request);
  if (oversized) return oversized;
  try {
    assertSameOrigin(request);
    const form = await request.formData();
    const raw = String(form.get("payload") || "");
    const payload = JSON.parse(raw) as unknown;
    const method = payload && typeof payload === "object" && "paymentMethod" in payload ? (payload as { paymentMethod?: unknown }).paymentMethod : "";
    const proof = form.get("proof");
    let paymentProof = "";
    if (method !== "cod") {
      if (!(proof instanceof File) || proof.size <= 0) {
        throw new Error("Upload a screenshot of your payment.");
      }
      try {
        paymentProof = await saveImage(proof, "proofs");
      } catch (uploadError) {
        const message = uploadError instanceof Error ? uploadError.message : "";
        if (message === "Images must be under 5 MB.") throw new Error("This screenshot is too big. Use a photo under 5 MB.");
        if (message === "Upload a JPG, PNG, or WebP image." || message === "Choose an image.") throw new Error("Use a JPG, PNG, or WebP screenshot.");
        throw uploadError;
      }
    }
    const order = await placeOrder(payload, paymentProof);
    return Response.json(order);
  } catch (error) {
    return jsonError(error, "Could not place the order.");
  }
}
