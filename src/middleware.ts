// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, req.url));
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/login", req.url));
    if (session.user?.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect logged-in users away from auth pages
  if (session && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
