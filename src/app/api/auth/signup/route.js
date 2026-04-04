import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { attachAuthCookie, resolveRoleForEmail, signAuthToken } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { createUser, getUserByEmail } from "@/lib/store";
import { signupSchema } from "@/lib/validation";
import { serializeUser } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || "Invalid signup payload.", 400, "validation_error");
    }

    const existingUser = await getUserByEmail(parsed.data.email);
    if (existingUser) {
      return jsonError("An account with that email already exists.", 409, "email_taken");
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
    const hashedPassword = await bcrypt.hash(parsed.data.password, saltRounds);
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      password: hashedPassword,
      role: resolveRoleForEmail(parsed.data.email),
    });

    const serializedUser = serializeUser(user);
    const token = signAuthToken({
      sub: serializedUser.id,
      email: serializedUser.email,
      role: serializedUser.role,
    });

    const response = NextResponse.json(
      {
        message: "Account created successfully.",
        user: serializedUser,
      },
      { status: 201 }
    );

    attachAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error?.code === 11000) {
      return jsonError("That email is already on file.", 409, "email_taken");
    }

    return jsonError("Unable to create your account right now.", 500, "signup_failed");
  }
}
