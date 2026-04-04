import "server-only";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { getUserById } from "@/lib/store";
import { normalizeEmail, serializeUser } from "@/lib/utils";

export const AUTH_COOKIE_NAME = "whiteloo_auth";

function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "whiteloo-dev-jwt-secret";
  }

  throw new Error("JWT_SECRET is not configured. Add it to your environment variables.");
}

function getCookieConfig() {
  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function resolveRoleForEmail(email) {
  const admins = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => normalizeEmail(value))
    .filter(Boolean);

  return admins.includes(normalizeEmail(email)) ? "admin" : "user";
}

export function signAuthToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export function verifyAuthToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (_error) {
    return null;
  }
}

export function attachAuthCookie(response, token) {
  response.cookies.set({
    ...getCookieConfig(),
    value: token,
  });
}

export function clearAuthCookie(response) {
  response.cookies.set({
    ...getCookieConfig(),
    value: "",
    maxAge: 0,
  });
}

export async function getSessionUser() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyAuthToken(token);
  if (!payload?.sub) return null;

  const user = await getUserById(payload.sub);
  return user ? serializeUser(user) : null;
}
