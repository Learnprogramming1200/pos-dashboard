import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = ["/login", "/signup", "/forgotPassword"];
// Added /dashboard for unified operational roles
const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/superadmin", "/cashier", "/manager"];
// Operational roles that can access /dashboard
const OPERATIONAL_ROLES = ["admin", "manager", "cashier"];

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
  const role = token?.role;
  const isActive = token?.isActive;

  const isAuthPage = startsWithAny(pathname, AUTH_PAGES);
  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES);
  const isDashboard = pathname.startsWith("/dashboard");
  const isRoot = pathname === "/";

  // Helper: redirect function
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  // --- A) Root smart redirect ---
  if (isRoot && isAuthenticated) {
    const sessionLand = request.cookies.get("sessionLand")?.value;

    if (!sessionLand) {
      // Dynamically determine target based on role
      // Superadmin goes to /superadmin, others can go to /dashboard
      let target = null;
      if (role === "superadmin") {
        target = "/superadmin";
      } else if (OPERATIONAL_ROLES.includes(role) && isActive) {
        // Redirect to /dashboard for operational roles (new unified route)
        target = "/dashboard";
      }

      if (target) {
        const res = redirectTo(target);
        res.cookies.set("sessionLand", "true", { path: "/" });
        return res;
      }
    }
  }

  // --- B) Auth pages (login/signup) ---
  if (isAuthPage && isAuthenticated) {
    if (role === "superadmin") return redirectTo("/superadmin");
    // Redirect operational roles to /dashboard
    if (OPERATIONAL_ROLES.includes(role) && isActive) return redirectTo("/dashboard");
    return redirectTo("/");
  }

  // --- C) Protected routes ---
  if (isProtected) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // --- C1) Unified /dashboard route (NEW) ---
    // All operational roles (admin, manager, cashier) can access
    // Superadmin can also access for testing purposes
    // Page-level authorization is handled by PageGuard component
    if (isDashboard) {
      const canAccessDashboard =
        role === "superadmin" ||
        (OPERATIONAL_ROLES.includes(role) && isActive);

      if (!canAccessDashboard) {
        return redirectTo("/login");
      }

      // Set role cookie and proceed
      // NOTE: No heavy permission checks here - that's done by PageGuard
      const response = NextResponse.next();
      if (role) {
        response.cookies.set("pos-role", role, {
          path: "/",
          maxAge: 60 * 60 * 24
        });
      }
      return response;
    }

    // --- C2) Legacy role-specific routes (kept for backward compatibility) ---
    if (pathname.startsWith("/admin")) {
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
