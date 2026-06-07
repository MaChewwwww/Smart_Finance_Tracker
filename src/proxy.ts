import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/debts",
  "/reports",
  "/goals",
  "/reminders",
  "/chatbot",
  "/settings",
];

const AUTH_PAGES = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  let isAuthenticated = false;
  let setCookieHeaders: string[] = [];

  // 1. Verify access token
  if (accessToken) {
    const payload = await verifyJWT(accessToken);
    if (payload) {
      isAuthenticated = true;
    }
  }

  // 2. If access token is expired/missing but refresh token exists, attempt auto-refresh
  if (!isAuthenticated && refreshToken) {
    try {
      const refreshUrl = new URL("/api/auth/refresh", req.nextUrl.origin);
      
      const refreshResponse = await fetch(refreshUrl.toString(), {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.success) {
          isAuthenticated = true;
          // Capture new set-cookie headers from the refresh response
          setCookieHeaders = refreshResponse.headers.getSetCookie();
        }
      }
    } catch (err) {
      console.error("Proxy auto-refresh error:", err);
    }
  }

  // 3. Handle Protected Routes
  if (isProtected) {
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL("/login", req.nextUrl));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }

    const response = NextResponse.next();
    // Forward new rotated cookies if refresh occurred
    if (setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
    }
    return response;
  }

  // 4. Handle Auth Pages (login, register, etc.)
  if (isAuthPage) {
    if (isAuthenticated) {
      const response = NextResponse.redirect(new URL("/dashboard", req.nextUrl));
      if (setCookieHeaders.length > 0) {
        setCookieHeaders.forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });
      }
      return response;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/debts/:path*",
    "/reports/:path*",
    "/goals/:path*",
    "/reminders/:path*",
    "/chatbot/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ],
};
