import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "neelofar-lawn",
    name: "3 Piece Embroidered Lawn Suit",
    collection: "Neelofar",
    description: "Emerald lawn kameez with white embroidery at the neck and cuffs, a matching shalwar, and a light dupatta.",
    price: 6850,
    compareAt: 7600,
    category: "lawn",
    fabric: "Lawn",
    featured: true,
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "aab-e-rawan",
    name: "3 Piece Printed Lawn Suit",
    collection: "Aab-e-Rawan",
    description: "Ivory lawn printed with blue florals, stitched as a kameez, shalwar, and dupatta.",
    price: 7450,
    compareAt: null,
    category: "shalwar-kameez",
    fabric: "Lawn",
    featured: false,
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "gerua-lawn",
    name: "3 Piece Printed Lawn Suit",
    collection: "Gerua",
    description: "Terracotta and rust printed lawn with a cream dupatta. An easy daytime three-piece.",
    price: 5950,
    compareAt: 6500,
    category: "shalwar-kameez",
    fabric: "Lawn",
    featured: false,
    isNew: false,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "gulnar-chiffon",
    name: "3 Piece Chiffon Party Suit",
    collection: "Gulnar",
    description: "Lilac chiffon with silver embroidery, cut for evenings, with a soft dupatta.",
    price: 12900,
    compareAt: null,
    category: "chiffon",
    fabric: "Chiffon",
    featured: true,
    isNew: false,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "zari-chiffon",
    name: "3 Piece Zari Chiffon Suit",
    collection: "Zari",
    description: "Champagne chiffon with a wide gold border and an ivory trouser.",
    price: 14200,
    compareAt: null,
    category: "chiffon",
    fabric: "Chiffon",
    featured: true,
    isNew: false,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "noor-formal",
    name: "3 Piece Raw Silk Formal",
    collection: "Noor",
    description: "Ivory raw silk formal suit with a clean placket, straight trousers, and a light dupatta.",
    price: 16400,
    compareAt: null,
    category: "formal",
    fabric: "Raw Silk",
    featured: true,
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "shabnam-velvet",
    name: "3 Piece Embroidered Festive Suit",
    collection: "Shabnam",
    description: "Deep maroon festive suit with dense floral embroidery and a matching dupatta.",
    price: 18900,
    compareAt: null,
    category: "formal",
    fabric: "Velvet",
    featured: false,
    isNew: true,
    sizes: ["XS", "S", "M", "L"],
  },
  {
    slug: "gulabi-formal",
    name: "3 Piece Organza Formal",
    collection: "Gulabi",
    description: "Dusty rose formal suit with gold embroidery and a flowing dupatta.",
    price: 16800,
    compareAt: null,
    category: "formal",
    fabric: "Organza",
    featured: false,
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "saba-kurta",
    name: "2 Piece Embroidered Cotton Kurta",
    collection: "Saba",
    description: "Sage cotton kurta with gold embroidery and a straight trouser for everyday wear.",
    price: 4200,
    compareAt: 4800,
    category: "kurtas",
    fabric: "Cotton",
    featured: false,
    isNew: false,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "siyah-kurta",
    name: "2 Piece Embroidered Khaddar Kurta",
    collection: "Siyah",
    description: "Black khaddar kurta with gold embroidery and a straight trouser.",
    price: 5800,
    compareAt: null,
    category: "kurtas",
    fabric: "Khaddar",
    featured: false,
    isNew: true,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "meher-bridal",
    name: "3 Piece Embroidered Bridal Suit",
    collection: "Meher",
    description: "Maroon bridal kameez with heavy gold embroidery, matching trousers, and an organza dupatta.",
    price: 48500,
    compareAt: null,
    category: "bridal",
    fabric: "Organza",
    featured: true,
    isNew: false,
    sizes: ["S", "M", "L"],
  },
  {
    slug: "moti-bridal",
    name: "3 Piece Pearl Bridal Suit",
    collection: "Moti",
    description: "Pearl white bridal suit with gold threadwork and a gold dupatta.",
    price: 54000,
    compareAt: null,
    category: "bridal",
    fabric: "Jacquard",
    featured: false,
    isNew: false,
    sizes: ["S", "M", "L", "XL"],
  },
];

async function main() {
  for (const [index, product] of products.entries()) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        ...product,
        details: "Sample catalogue piece. Replace the photo, price, and copy from the admin panel before selling.",
        sizes: JSON.stringify(product.sizes),
        images: JSON.stringify([`/images/looks/${product.slug}.jpg`, `/images/products/${product.slug}.jpg`]),
        inStock: true,
        isSample: true,
        createdAt: new Date(Date.UTC(2026, 10, 20, 8, 0, products.length - index)),
      },
    });
  }
  const count = await prisma.product.count();
  console.log(`Catalogue ready. ${count} pieces in the database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
