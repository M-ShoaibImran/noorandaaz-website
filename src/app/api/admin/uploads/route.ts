import { jsonError, tooLarge } from "@/lib/api-error";
import { assertSameOrigin, isAdmin } from "@/lib/auth";
import { saveImage } from "@/lib/uploads";

export async function POST(request: Request) {
  const oversized = tooLarge(request);
  if (oversized) return oversized;
  try {
    assertSameOrigin(request);
    if (!(await isAdmin())) return Response.json({ error: "Sign in required." }, { status: 401 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose an image." }, { status: 400 });
    const path = await saveImage(file, "products");
    return Response.json({ path });
  } catch (error) {
    return jsonError(error, "Upload failed.");
  }
}
