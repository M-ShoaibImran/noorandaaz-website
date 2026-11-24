import { z } from "zod";
import { db } from "@/lib/db";
import { grantOrderView } from "@/lib/auth";
import { CUSTOM_FABRICS, validMeasure } from "@/lib/catalog";
import { isCity } from "@/lib/cities";
import { getPublicConfig } from "@/lib/config";
import { productLabel, shippingFee } from "@/lib/format";
import { isPakistaniMobile, normalizePhone } from "@/lib/phone";
import { isManagedImage } from "@/lib/uploads";
import { randomInt } from "crypto";

const measurementSchema = z.object({
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
});

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(20),
  email: z.string().trim().max(120).optional(),
  address: z.string().trim().min(8).max(300),
  city: z.string().trim(),
  deliveryNotes: z.string().trim().max(400).optional(),
  paymentMethod: z.enum(["cod", "jazzcash", "easypaisa", "bank"]),
  paymentRef: z.string().trim().max(80).optional(),
  items: z
    .array(
      z.object({
        kind: z.enum(["ready", "custom"]),
        productId: z.string().optional(),
        size: z.string().optional(),
        quantity: z.number().int().min(1).max(5).optional(),
        custom: z
          .object({
            designType: z.enum(["catalog", "upload", "describe"]),
            designProductId: z.string().optional(),
            designNotes: z.string().max(2000).optional(),
            referenceImage: z.string().optional(),
            fabricId: z.string(),
            measurements: measurementSchema,
          })
          .optional(),
      }),
    )
    .min(1)
    .max(20),
});

function orderNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let body = "";
  for (let i = 0; i < 6; i++) body += alphabet[randomInt(alphabet.length)];
  return `NA-${body}`;
}

function emailOk(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function placeOrder(payload: unknown, paymentProof = "") {
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Check the form and try again.");
  }
  const input = parsed.data;
  const phone = normalizePhone(input.phone);
  if (!isPakistaniMobile(phone)) throw new Error("Please enter a valid mobile number like 0300 1234567");
  if (!isCity(input.city)) throw new Error("Choose a city in Pakistan.");
  const email = input.email?.trim() || "";
  if (email && !emailOk(email)) throw new Error("Enter a valid email, or leave it blank.");
  if (input.paymentMethod !== "cod") {
    if ((input.paymentRef || "").trim().length < 4) {
      throw new Error("Enter the transaction ID or transfer reference.");
    }
    if (!paymentProof || !isManagedImage(paymentProof)) {
      throw new Error("Upload a screenshot of your payment.");
    }
  }

  const lines = [];
  for (const item of input.items) {
    if (item.kind === "ready") {
      if (!item.productId) throw new Error("A bag item is missing its piece.");
      const product = await db.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.inStock) throw new Error("A piece in your bag is no longer available.");
      const sizes = JSON.parse(product.sizes) as string[];
      if (!item.size || !sizes.includes(item.size)) throw new Error(`Choose a valid size for ${product.name}.`);
      const quantity = item.quantity ?? 1;
      const images = JSON.parse(product.images) as string[];
      lines.push({
        kind: "ready",
        productId: product.id,
        name: productLabel(product),
        size: item.size,
        fabric: product.fabric,
        quantity,
        price: product.price,
        image: images[0] || "",
        designType: "",
        designNotes: "",
        referenceImage: "",
        shirtLength: "",
        chest: "",
        waist: "",
        hips: "",
        shoulder: "",
        sleeveLength: "",
        armhole: "",
        trouserLength: "",
        trouserBottom: "",
        neckDepth: "",
        measurementNotes: "",
      });
      continue;
    }

    if (!item.custom) throw new Error("The custom stitching order is incomplete.");
    const fabric = CUSTOM_FABRICS.find((option) => option.id === item.custom?.fabricId);
    if (!fabric) throw new Error("Choose a fabric for the custom order.");
    const measurements = item.custom.measurements;
    const fields = [
      ["shirt length", measurements.shirtLength],
      ["chest", measurements.chest],
      ["waist", measurements.waist],
      ["hips", measurements.hips],
      ["shoulder", measurements.shoulder],
      ["sleeve length", measurements.sleeveLength],
      ["armhole", measurements.armhole],
      ["trouser length", measurements.trouserLength],
      ["trouser bottom", measurements.trouserBottom],
      ["neck depth", measurements.neckDepth],
    ] as const;
    for (const [label, value] of fields) {
      if (!validMeasure(value)) throw new Error(`Enter ${label} in inches, for example 36 or 36.5.`);
    }
    let name = "Custom stitching";
    if (item.custom.designType === "catalog") {
      if (!item.custom.designProductId) throw new Error("Choose a design to stitch.");
      const design = await db.product.findUnique({ where: { id: item.custom.designProductId } });
      if (!design) throw new Error("That design is no longer in the shop.");
      name = `Custom · ${productLabel(design)}`;
    } else if (item.custom.designType === "upload") {
      if (!item.custom.referenceImage || !isManagedImage(item.custom.referenceImage)) {
        throw new Error("Upload a reference photo, or describe the design instead.");
      }
      name = "Custom · your reference photo";
    } else {
      if ((item.custom.designNotes || "").trim().length < 12) {
        throw new Error("Describe the design in a sentence or two.");
      }
      name = "Custom · described design";
    }
    lines.push({
      kind: "custom",
      productId: item.custom.designProductId || "",
      name,
      size: "Custom",
      fabric: fabric.name,
      quantity: 1,
      price: fabric.price,
      image: item.custom.referenceImage || "",
      designType: item.custom.designType,
      designNotes: (item.custom.designNotes || "").trim(),
      referenceImage: item.custom.referenceImage || "",
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
      measurementNotes: (measurements.notes || "").trim(),
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const config = getPublicConfig();
  const deliveryFee = shippingFee(subtotal, config.deliveryFee, config.freeDeliveryThreshold);
  let number = orderNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    const existing = await db.order.findUnique({ where: { orderNumber: number } });
    if (!existing) break;
    number = orderNumber();
  }

  await db.order.create({
    data: {
      orderNumber: number,
      customerName: input.customerName.trim(),
      phone,
      email,
      address: input.address.trim(),
      city: input.city,
      deliveryNotes: input.deliveryNotes?.trim() || "",
      paymentMethod: input.paymentMethod,
      paymentRef: input.paymentMethod === "cod" ? "" : (input.paymentRef || "").trim(),
      paymentProof,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      items: { create: lines },
    },
  });
  await grantOrderView(number);
  return { orderNumber: number, total: subtotal + deliveryFee };
}
