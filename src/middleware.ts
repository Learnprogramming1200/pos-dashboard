import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = ["/login", "/signup", "/forgotPassword"];
const PROTECTED_PREFIXES = ["/admin", "/superadmin", "/cashier", "/manager"];

const isStaticAsset = (pathname: string) => {
  return /\.(jpg|jpeg|png|gif|svg|ico|css|js|json|woff|woff2|ttf|eot|webp|avif)$/i.test(pathname);
};

const startsWithAny = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname.startsWith(route));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Skip static assets
  if (isStaticAsset(pathname)) return NextResponse.next();

  // 2) Get token
  const token: any = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const role = token?.role; // 'admin' or 'superadmin'
  const isActive = token?.isActive;

  const isAuthPage = startsWithAny(pathname, AUTH_PAGES);
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const isRoot = pathname === "/";

  // Helper: redirect function
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  // --- A) Root smart redirect ---
  if (isRoot && isAuthenticated) {
    const sessionLand = request.cookies.get("sessionLand")?.value;

    if (!sessionLand) {
      // Dynamically determine target based on role
      let target = null;
      if (role === "superadmin") {
        target = "/superadmin";
      } else if (role === "admin" && isActive) {
        target = "/admin";
      } else if (role === "manager" && isActive) {
        target = "/manager";
      } else if (role === "cashier" && isActive) {
        target = "/cashier";
      }

      if (target) {
        const res = redirectTo(target);
        // We still use sessionLand to allow the user to visit home page after initial mount
        res.cookies.set("sessionLand", "true", { path: "/" });
        return res;
      }
    }
  }

  // --- B) Auth pages (login/signup) ---
  if (isAuthPage && isAuthenticated) {
    if (role === "superadmin") return redirectTo("/superadmin");
    if (role === "admin" && isActive) return redirectTo("/admin");
    if (role === "manager" && isActive) return redirectTo("/manager");
    if (role === "cashier" && isActive) return redirectTo("/cashier");
    return redirectTo("/");
  }

  // --- C) Protected routes ---
  if (isProtected) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Role-specific protection
    if (pathname.startsWith("/admin")) {
      // Allow if admin (and active) OR if superadmin
      const canAccessAdmin = (role === "admin" && isActive) || role === "superadmin";
      if (!canAccessAdmin) {
        return redirectTo("/");
      }
    }

    if (pathname.startsWith("/superadmin") && role !== "superadmin") {
      return role === "admin" && isActive ? redirectTo("/admin") : redirectTo("/");
    }

    if (pathname.startsWith("/cashier")) {
      const canAccessCashier = (role === "cashier" && isActive) || role === "superadmin";
      if (!canAccessCashier) {
        return redirectTo("/");
      }
    }

    if (pathname.startsWith("/manager")) {
      const canAccessManager = (role === "manager" && isActive) || role === "superadmin";
      if (!canAccessManager) {
        return redirectTo("/");
      }
    }

    // --- D) Sync session data to response cookies ---
    const response = NextResponse.next();

    // Note: pos-session cookie is set directly by the backend via Set-Cookie header
    // during the client-side login API call

    // Sync pos-role
    if (role) {
      response.cookies.set("pos-role", role, {
        path: "/",
        maxAge: 60 * 60 * 24
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|css|js|json|woff|woff2|ttf|eot|webp|avif)$).*)",
  ],
};
