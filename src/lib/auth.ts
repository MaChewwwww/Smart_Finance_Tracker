import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "e9a9a3b7c25e4dcf8170c1d1020bf3480fe3d2dcf4434220b332d43cb8d234a9"
);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export interface RefreshTokenPayload extends TokenPayload {
  familyId: string;
}

/**
 * Signs a short-lived access JWT token.
 */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  const expiry = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(JWT_SECRET);
}

/**
 * Signs a long-lived refresh JWT token.
 */
export async function signRefreshToken(payload: TokenPayload, familyId: string): Promise<string> {
  const expiryDays = process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "7";
  return new SignJWT({ ...payload, familyId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${expiryDays}d`)
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT token (works in Edge middleware and server environment).
 */
export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Sets secure HTTP-only cookies for access and refresh tokens.
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  // Set Access Token
  cookieStore.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes in seconds
  });

  // Set Refresh Token
  const refreshExpiryDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || "7", 10);
  cookieStore.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: refreshExpiryDays * 24 * 60 * 60, // Days in seconds
  });
}

/**
 * Clears authentication cookies upon logout.
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
