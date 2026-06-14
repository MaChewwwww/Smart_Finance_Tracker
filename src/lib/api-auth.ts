import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Reads and verifies the access token cookie from a route handler request.
 * Returns the authenticated user, or null if unauthenticated.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const accessToken = req.cookies.get("accessToken")?.value;
  if (!accessToken) return null;

  const payload = await verifyJWT(accessToken);
  if (!payload || !payload.userId) return null;

  return {
    id: payload.userId as string,
    email: payload.email as string,
    name: payload.name as string,
  };
}

/**
 * Standard success response shape used across the API.
 */
export function ok(data?: unknown, message?: string) {
  return NextResponse.json({ success: true, data, message });
}

/**
 * Standard error response shape used across the API.
 */
export function fail(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

/**
 * Shorthand 401 for unauthenticated requests.
 */
export function unauthorized() {
  return fail("UNAUTHORIZED", "Not authenticated.", 401);
}
