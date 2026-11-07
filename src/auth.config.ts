import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      const isProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/transactions") ||
        nextUrl.pathname.startsWith("/income") ||
        nextUrl.pathname.startsWith("/reports") ||
        nextUrl.pathname.startsWith("/settings");

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) callbackUrl += nextUrl.search;
        return Response.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
        );
      }

      if (nextUrl.pathname === "/") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        } else {
          return Response.redirect(new URL("/login", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

