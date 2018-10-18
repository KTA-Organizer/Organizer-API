import crypto from "crypto";
export function genRandomHash() {
  const seed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return crypto.createHash("sha256").update(seed).digest("hex");
}