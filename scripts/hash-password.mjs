import { randomBytes, scryptSync } from "crypto";
import { readFileSync } from "fs";

const fromArg = process.argv.slice(2).join(" ");
const password = fromArg || readFileSync(0, "utf8").replace(/\r?\n$/, "");
if (!password) {
  console.error("Usage: npm run hash-password -- <password>");
  console.error("Or pipe the password on stdin. The password is not printed.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const line = `scrypt$${salt}$${hash}`;
process.stdout.write(`${line}\n`);
process.stderr.write(`In .env, escape each $ so Next does not expand it:\nADMIN_PASSWORD_HASH="${line.replaceAll("$", "\\$")}"\n`);
