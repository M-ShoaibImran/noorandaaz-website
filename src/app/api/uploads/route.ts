import { assertSameOrigin } from "@/lib/auth";
import { saveImage } from "@/lib/uploads";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose an image." }, { status: 400 });
    const path = await saveImage(file, "references");
    return Response.json({ path });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
