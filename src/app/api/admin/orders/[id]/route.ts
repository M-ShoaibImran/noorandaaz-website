import { z } from "zod";
import { assertSameOrigin, isAdmin } from "@/lib/auth";
import { STATUSES } from "@/lib/catalog";
import { db } from "@/lib/db";

const bodySchema = z.object({
  status: z.string().optional(),
  remarks: z.string().max(500).optional(),
  action: z.enum(["remove", "restore"]).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await isAdmin())) return Response.json({ error: "Sign in required." }, { status: 401 });
    const { id } = await context.params;
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Check the form and try again." }, { status: 400 });
    const order = await db.order.findUnique({ where: { id } });
    if (!order) return Response.json({ error: "That order was not found." }, { status: 404 });
    const remarks = (parsed.data.remarks || "").trim();

    if (parsed.data.action === "remove") {
      if (remarks.length < 3) return Response.json({ error: "Write a short reason the customer can read." }, { status: 400 });
      if (order.status === "removed") return Response.json({ error: "This order is already removed." }, { status: 400 });
      await db.order.update({
        where: { id },
        data: {
          statusBeforeRemoval: order.status,
          status: "removed",
          customerRemarks: remarks,
          removedAt: new Date(),
        },
      });
      return Response.json({ ok: true });
    }

    if (parsed.data.action === "restore") {
      if (order.status !== "removed") return Response.json({ error: "This order is not removed." }, { status: 400 });
      const previous = order.statusBeforeRemoval && order.statusBeforeRemoval !== "removed" ? order.statusBeforeRemoval : "pending";
      await db.order.update({
        where: { id },
        data: {
          status: previous,
          statusBeforeRemoval: "",
          customerRemarks: "",
          removedAt: null,
        },
      });
      return Response.json({ ok: true });
    }

    const status = parsed.data.status || "";
    if (status === "removed" || !STATUSES.some((item) => item.id === status && item.id !== "removed")) {
      return Response.json({ error: "Choose a valid status." }, { status: 400 });
    }
    if (order.status === "removed") return Response.json({ error: "Restore the order before changing its status." }, { status: 400 });
    await db.order.update({
      where: { id },
      data: {
        status,
        customerRemarks: status === "cancelled" ? remarks : "",
      },
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not update." }, { status: 400 });
  }
}
