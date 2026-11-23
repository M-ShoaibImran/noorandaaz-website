import { assertSameOrigin } from "@/lib/auth";
import { placeOrder } from "@/lib/place-order";
import { saveImage } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const form = await request.formData();
    const raw = String(form.get("payload") || "");
    const payload = JSON.parse(raw) as unknown;
    const proof = form.get("proof");
    const paymentProof = proof instanceof File && proof.size > 0 ? await saveImage(proof, "proofs") : "";
    const order = await placeOrder(payload, paymentProof);
    return Response.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place the order.";
    return Response.json({ error: message }, { status: 400 });
  }
}
