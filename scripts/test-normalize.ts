import assert from "node:assert/strict";
import { FRIENDLY_ERROR, readJson } from "../src/lib/read-json";
import { isPakistaniMobile, normalizeOrderNumber, normalizePhone } from "../src/lib/phone";

const canonical = "03001234567";
const phones = [
  "03001234567",
  "0300 1234567",
  "0300-1234567",
  "0300.123.4567",
  "(0300) 1234567",
  "3001234567",
  "923001234567",
  "+92 300 1234567",
  "+923001234567",
  "00923001234567",
  "0092 300-1234567",
  "۰۳۰۰۱۲۳۴۵۶۷",
  "٠٣٠٠١٢٣٤٥٦٧",
  "０３００１２３４５６７",
];

for (const sample of phones) {
  assert.equal(normalizePhone(sample), canonical, sample);
  assert.equal(isPakistaniMobile(sample), true, sample);
}

assert.equal(isPakistaniMobile("021234567"), false);
assert.equal(isPakistaniMobile("030012345"), false);
assert.equal(isPakistaniMobile(""), false);

assert.equal(normalizeOrderNumber("  na-ab12cd "), "NA-AB12CD");
assert.equal(normalizeOrderNumber("#NA-AB12CD"), "NA-AB12CD");
assert.equal(normalizeOrderNumber("ab12cd"), "NA-AB12CD");
assert.equal(normalizeOrderNumber("NAAB12CD"), "NA-AB12CD");
assert.equal(normalizeOrderNumber("na-ab۱۲cd"), "NA-AB12CD");
assert.equal(normalizeOrderNumber(""), "");

async function checkJson() {
  const html = await readJson<{ error?: string }>(new Response("<!DOCTYPE html>", { status: 500, headers: { "content-type": "text/html" } }));
  assert.equal(html.ok, false);
  assert.equal(html.data.error, FRIENDLY_ERROR);
  const json = await readJson<{ error?: string }>(Response.json({ error: "Upload a screenshot of your payment." }, { status: 400 }));
  assert.equal(json.ok, false);
  assert.equal(json.data.error, "Upload a screenshot of your payment.");
}

checkJson().then(() => {
  console.log(`normalize checks passed (${phones.length} phone formats)`);
});
