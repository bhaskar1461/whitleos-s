import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { attachAuthCookie, signAuthToken } from "@/lib/auth";
import { ensureDefaultAdminAccount } from "@/lib/admin-bootstrap";
import { jsonError } from "@/lib/http";
import { getUserByEmail } from "@/lib/store";
import { loginSchema } from "@/lib/validation";
import { serializeUser } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid login payload.", 400, "validation_error");
    }

    await ensureDefaultAdminAccount();

    const user = await getUserByEmail(parsed.data.email);
    if (!user) {
      return jsonError("No account matches that email.", 401, "invalid_credentials");
    }

    const passwordMatches = await bcrypt.compare(parsed.data.password, user.password);
    if (!passwordMatches) {
      return jsonError("Incorrect password.", 401, "invalid_credentials");
    }

    const serializedUser = serializeUser(user);
    const token = signAuthToken({
      sub: serializedUser.id,
      email: serializedUser.email,
      role: serializedUser.role,
    });

    const response = NextResponse.json({
      message: "Login successful.",
      user: serializedUser,
    });

    attachAuthCookie(response, token);
    return response;
  } catch (_error) {
    return jsonError("Unable to log you in right now.", 500, "login_failed");
  }
}
