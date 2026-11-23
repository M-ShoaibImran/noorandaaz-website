import { z } from "zod";
import { assertSameOrigin } from "@/lib/auth";
import { validMeasure } from "@/lib/catalog";
import { db } from "@/lib/db";
import { isPakistaniMobile, normalizePhone } from "@/lib/phone";

const schema = z.object({
  phone: z.string(),
  label: z.string().trim().min(1).max(40),
  measurements: z.object({
    shirtLength: z.string(),
    chest: z.string(),
    waist: z.string(),
    hips: z.string(),
    shoulder: z.string(),
    sleeveLength: z.string(),
    armhole: z.string(),
    trouserLength: z.string(),
    trouserBottom: z.string(),
    neckDepth: z.string(),
    notes: z.string().optional(),
  }),
});

export async function GET(request: Request) {
  const phone = normalizePhone(new URL(request.url).searchParams.get("phone") || "");
  if (!isPakistaniMobile(phone)) return Response.json({ error: "Enter a valid Pakistani mobile number." }, { status: 400 });
  const profiles = await db.measurementProfile.findMany({
    where: { phone },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  return Response.json({ profiles });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ error: "Check the measurements and try again." }, { status: 400 });
    const phone = normalizePhone(parsed.data.phone);
    if (!isPakistaniMobile(phone)) return Response.json({ error: "Enter a valid Pakistani mobile number." }, { status: 400 });
    const measurements = parsed.data.measurements;
    const values = [
      measurements.shirtLength,
      measurements.chest,
      measurements.waist,
      measurements.hips,
      measurements.shoulder,
      measurements.sleeveLength,
      measurements.armhole,
      measurements.trouserLength,
      measurements.trouserBottom,
      measurements.neckDepth,
    ];
    if (values.some((value) => !validMeasure(value))) {
      return Response.json({ error: "Enter each measurement in inches." }, { status: 400 });
    }
    const data = {
      phone,
      label: parsed.data.label,
      shirtLength: measurements.shirtLength.trim(),
      chest: measurements.chest.trim(),
      waist: measurements.waist.trim(),
      hips: measurements.hips.trim(),
      shoulder: measurements.shoulder.trim(),
      sleeveLength: measurements.sleeveLength.trim(),
      armhole: measurements.armhole.trim(),
      trouserLength: measurements.trouserLength.trim(),
      trouserBottom: measurements.trouserBottom.trim(),
      neckDepth: measurements.neckDepth.trim(),
      notes: (measurements.notes || "").trim(),
    };
    const existing = await db.measurementProfile.findFirst({ where: { phone, label: data.label } });
    if (existing) await db.measurementProfile.update({ where: { id: existing.id }, data });
    else await db.measurementProfile.create({ data });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save." }, { status: 400 });
  }
}
