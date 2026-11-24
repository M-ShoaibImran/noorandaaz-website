# Noorandaaz

A shop for Noorandaaz, a women's tailoring and clothing house in Pakistan. Customers can buy ready-made suits in XS–XL or order custom stitching with their measurements. Delivery is inside Pakistan only.

Payments in this version are manual: cash on delivery, JazzCash, Easypaisa, and bank transfer. There is no live card gateway. Orders are saved in SQLite and managed from a password-protected admin panel.

The catalogue that ships with the project is **sample data**. Photos are original studio placeholders, not a live stock list.

## Run it

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Open [http://127.0.0.1:3847](http://127.0.0.1:3847).

Sign in at [http://127.0.0.1:3847/admin](http://127.0.0.1:3847/admin). Set `ADMIN_PASSWORD_HASH` before real orders. Until that hash is set, the sample password is `noorandaaz-admin` (from `ADMIN_PASSWORD`). Login allows 5 attempts per 15 minutes per IP.

## Business settings

All of these live in `.env`. See `.env.example`. Restart the server after changing them.

| Variable | What it does |
| --- | --- |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Digits only, country code, no plus. Example: `923001234567`. Used by every WhatsApp button. |
| `NEXT_PUBLIC_WHATSAPP_DISPLAY` | The number shown to customers. |
| `NEXT_PUBLIC_JAZZCASH_NUMBER` / `NEXT_PUBLIC_JAZZCASH_TITLE` | JazzCash account shown at checkout. |
| `NEXT_PUBLIC_EASYPAISA_NUMBER` / `NEXT_PUBLIC_EASYPAISA_TITLE` | Easypaisa account shown at checkout. |
| `NEXT_PUBLIC_BANK_NAME` / `NEXT_PUBLIC_BANK_TITLE` / `NEXT_PUBLIC_BANK_ACCOUNT` / `NEXT_PUBLIC_BANK_IBAN` | Bank transfer details. |
| `NEXT_PUBLIC_DELIVERY_FEE` | Flat delivery fee in whole rupees. Default `250`. |
| `NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD` | Free delivery at or above this subtotal. Default `5000`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Shown on the contact page. |
| `NEXT_PUBLIC_SITE_URL` | Public URL used in WhatsApp messages and SEO. |
| `ADMIN_PASSWORD_HASH` | Owner password as `scrypt$<saltHex>$<hashHex>`. When this is set, `ADMIN_PASSWORD` is ignored. Create it with `npm run hash-password`. |
| `ADMIN_PASSWORD` | Plaintext password used only when `ADMIN_PASSWORD_HASH` is empty. Sample value: `noorandaaz-admin`. |
| `SESSION_SECRET` | Signs the admin and order-view cookies. Use a long random string. Changing it signs everyone out. |
| `DATABASE_URL` | SQLite file. Default `file:./dev.db` (stored in `prisma/`). |

The JazzCash, Easypaisa, and bank values in `.env.example` are placeholders. Checkout shows a warning while the IBAN is still the sample value.

## What customers can do

- Browse and filter the shop by category, fabric, size, and price.
- Open a piece, choose a size, add it to the bag, or send the order on WhatsApp.
- Start custom stitching: pick a shop design, upload a reference, or describe it, then choose fabric and enter measurements. Measurements can be saved on the phone and, with a mobile number, loaded again later.
- Check out with name, phone, optional email, address, city, and delivery notes.
- Pay by cash on delivery, JazzCash, Easypaisa, or bank transfer. JazzCash, Easypaisa, and bank transfer require a transaction ID and a payment screenshot.
- See an order number, then track the order later with that number and the same phone. Track my order is in the header and on the confirmation page.

## Admin

`/admin` lists orders. Statuses: pending, confirmed, stitching, dispatched, delivered, cancelled. Remove order keeps the record, asks for a reason the customer will see, and hides it until you open the Removed tab and restore it. An order page shows the address, measurements for custom work, and any payment screenshot.

Make the owner hash with `npm run hash-password` (pass the password as an argument, or pipe it on stdin). It prints `scrypt$<saltHex>$<hashHex>`. In `.env`, escape each `$` as `\$`, because Next treats `$name` as another variable and would otherwise erase the salt and hash:

```bash
ADMIN_PASSWORD_HASH="scrypt\$<saltHex>\$<hashHex>"
```

Leave `ADMIN_PASSWORD` empty once the hash is set. The check uses `crypto.scryptSync` (the salt is the hex string itself) and `crypto.timingSafeEqual`. A hash that is set, even if it is malformed, does not fall back to the sample password. Sign-in is limited to 5 attempts per 15 minutes for each IP. The limit is kept in memory on this server and resets when the process restarts. A sign-in lasts 7 days.

Change the password while signed in at `/admin/password`. The new password must be at least 10 characters and include one letter and one number. The new hash is saved in the SQLite database and is used instead of `ADMIN_PASSWORD_HASH` after that. Other browsers are signed out. This browser stays signed in.

If you are locked out, stop the server and delete the `adminPasswordHash` row from the `ShopSetting` table in `prisma/dev.db`. Then set a new `ADMIN_PASSWORD_HASH` with `npm run hash-password` and restart. Until a password is saved from the admin page, the `.env` hash is the one that signs you in.

`/admin/products` adds, edits, and deletes pieces, including photos.

## Deploy

This app expects one Node server and a disk that keeps the database and uploads.

```bash
npm install
cp .env.example .env
# edit .env: real WhatsApp number, payment accounts, ADMIN_PASSWORD_HASH, a long SESSION_SECRET, and NEXT_PUBLIC_SITE_URL
npm run setup
npm run build
npm start
```

The server listens on port `3847`. Put it behind your own HTTPS reverse proxy, or change the port in the `start` script.

Keep these paths on persistent storage:

- `prisma/dev.db`
- `public/uploads/` (payment screenshots, reference photos, and photos added in admin). The site serves these through `/api/uploads/...` so files saved after the server starts still show. Payment screenshots are only visible to a signed-in owner.

SQLite is a good fit for a single atelier server (a small VPS, or a platform such as Fly.io or Railway with a volume). Do not run several copies against one SQLite file. If you later need more than one server, point `DATABASE_URL` at Postgres and move uploads to object storage. The schema uses plain strings, so the provider change is small, but it is not wired up in this version.

`npm run setup` creates missing sample pieces and does not delete orders. To start over, stop the server, delete `prisma/dev.db`, and run `npm run setup` again.
