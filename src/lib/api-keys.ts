import { randomBytes, createHash } from "crypto";
import { prisma } from "./prisma";

export function generateApiKey(): string {
  return "vb_" + randomBytes(24).toString("hex");
}

export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function getKeyPrefix(key: string): string {
  return key.slice(0, 7) + "..." + key.slice(-4);
}

export async function validateApiKey(key: string) {
  const hash = hashKey(key);
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash: hash } });
  if (!apiKey || apiKey.revoked) return null;

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  });

  return apiKey;
}
