import { jsonError, tooLarge } from "@/lib/api-error";
import { assertSameOrigin } from "@/lib/auth";
import { saveImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const oversized = tooLarge(request);
  if (oversized) return oversized;
  try {
    assertSameOrigin(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose an image." }, { status: 400 });
    const path = await saveImage(file, "references");
    return Response.json({ path });
  } catch (error) {
    return jsonError(error, "Upload failed.");
  }
}
