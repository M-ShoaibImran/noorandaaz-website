export function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0092")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("92") && digits.length >= 12) digits = `0${digits.slice(2)}`;
  return digits;
}

export function isPakistaniMobile(input: string) {
  return /^03\d{9}$/.test(normalizePhone(input));
}

export function formatPhone(input: string) {
  const digits = normalizePhone(input);
  if (digits.length !== 11) return input.trim();
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function toWhatsAppNumber(input: string) {
  const digits = normalizePhone(input);
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}
