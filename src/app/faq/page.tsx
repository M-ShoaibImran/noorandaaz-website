import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ", description: "Answers about delivery, JazzCash, Easypaisa, bank transfer, custom stitching, and returns at Noorandaaz." };

const items = [
  ["Do you deliver outside Pakistan?", "No. Delivery is domestic only, to cities and towns inside Pakistan."],
  ["Can I pay cash on delivery?", "Yes. Choose Cash on delivery at checkout and pay the rider when the parcel arrives."],
  ["How do JazzCash and Easypaisa work?", "The checkout page shows the account name and number. Transfer the order total, enter the transaction ID, and upload a screenshot of the confirmation. We confirm the payment before stitching or dispatch."],
  ["How does a bank transfer work?", "We show the bank, account title, account number, and IBAN. Enter the transfer reference and upload a screenshot of the confirmation so we can match it."],
  ["How long does a ready-made order take?", "Usually 3–6 working days after confirmation. Remote areas can take longer."],
  ["How long does custom stitching take?", "Usually 10–18 working days after we confirm your measurements. If you send your own fabric, it starts when the fabric arrives."],
  ["Can I return a custom suit?", "Only if we made a mistake. Ready-made unworn pieces with tags can be returned within 7 days."],
  ["What if I am between sizes?", "Use the size guide, or order custom stitching and enter your measurements."],
  ["Can I reuse my measurements?", "Yes. On the custom order page, save them on your phone. Add your mobile number if you want to load them on another device."],
  ["Are the clothes in the shop real stock?", "The current catalogue is sample data, clearly marked, so the shop can be reviewed. Replace the pieces from the admin panel."],
];

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl">Questions</h1>
      <span className="mt-3 block h-px w-8" style={{ backgroundColor: "#B8893B" }} />
      <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
        {items.map(([question, answer]) => (
          <details key={question} className="group py-4">
            <summary className="flex min-h-11 cursor-pointer items-center text-base">{question}</summary>
            <p className="pt-2 text-sm leading-6 text-neutral-600">{answer}</p>
          </details>
        ))}
      </div>
    </article>
  );
}
