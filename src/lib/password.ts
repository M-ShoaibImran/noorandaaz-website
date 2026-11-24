import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function passwordRuleError(password: string) {
  if (password.length < 10) return "Use at least 10 characters.";
  if (!/[A-Za-z]/.test(password)) return "Include at least one letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  return "";
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyScrypt(input: string, configured: string) {
  const match = /^scrypt\$([0-9a-fA-F]+)\$([0-9a-fA-F]+)$/.exec(configured.trim());
  if (!match) return false;
  const salt = match[1];
  const expected = Buffer.from(match[2], "hex");
  if (expected.length !== 64 || match[2].length !== 128) return false;
  const actual = scryptSync(input, salt, 64);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
