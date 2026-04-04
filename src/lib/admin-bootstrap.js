import bcrypt from "bcryptjs";

import { upsertAdminUser } from "@/lib/store";

export const DEFAULT_ADMIN_EMAIL = "admin@123";
export const DEFAULT_ADMIN_PASSWORD = "admin123";
export const DEFAULT_ADMIN_NAME = "Administrator";

export async function ensureDefaultAdminAccount() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, saltRounds);
  return upsertAdminUser({
    email: DEFAULT_ADMIN_EMAIL,
    name: DEFAULT_ADMIN_NAME,
    passwordHash: hashedPassword,
  });
}
