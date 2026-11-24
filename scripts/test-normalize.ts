import assert from "node:assert/strict";
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

console.log(`normalize checks passed (${phones.length} phone formats)`);
