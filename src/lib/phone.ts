const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EXTENDED_ARABIC = "۰۱۲۳۴۵۶۷۸۹";
const FULLWIDTH = "０１２３４５６７８９";

export const ORDER_NUMBER_MESSAGE = "Please enter your order number";
export const PHONE_MESSAGE = "Please enter a valid mobile number like 0300 1234567";
export const ORDER_NOT_FOUND_MESSAGE = "We couldn't find an order with that number and phone. Please check them or WhatsApp us.";

export function toAsciiDigits(input: string) {
  return String(input ?? "").replace(/[٠-٩۰-۹０-９]/g, (char) => {
    const arabic = ARABIC_INDIC.indexOf(char);
    if (arabic >= 0) return String(arabic);
    const extended = EXTENDED_ARABIC.indexOf(char);
    if (extended >= 0) return String(extended);
    const full = FULLWIDTH.indexOf(char);
    return full >= 0 ? String(full) : char;
  });
}

export function normalizePhone(input: string) {
  let digits = toAsciiDigits(input).replace(/\D/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(4);
  else if (digits.startsWith("92")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10 && digits.startsWith("3")) return `0${digits}`;
  return digits;
}

export function isPakistaniMobile(input: string) {
  return /^03\d{9}$/.test(normalizePhone(input));
}

export function formatPhone(input: string) {
  const digits = normalizePhone(input);
  if (!isPakistaniMobile(digits)) return String(input ?? "").trim();
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function toWhatsAppNumber(input: string) {
  const digits = normalizePhone(input);
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export function normalizeOrderNumber(input: string) {
  const cleaned = toAsciiDigits(input).toUpperCase().replace(/[\s#._]/g, "");
  if (!cleaned) return "";
  let body = cleaned;
  if (body.startsWith("NA-")) body = body.slice(3);
  else if (body.startsWith("NA")) body = body.slice(2);
  body = body.replace(/[^A-Z0-9]/g, "");
  if (!body) return "";
  return `NA-${body}`;
}
