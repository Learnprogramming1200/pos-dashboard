import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = ["/login", "/signup", "/forgotPassword"];
const PROTECTED_PREFIXES = ["/admin", "/superadmin", "/cashier", "/manager", "/dashboard"];

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
  const secret = process.env.NEXTAUTH_SECRET || "6e33a5b76e66abd00cb61431131456f6";

  let token: any = await getToken({
    req: request as any,
    secret,
  });

  // Fallback: Try secure cookie name explicitly (in case auto-detection fails on Vercel)
  if (!token) {
    token = await getToken({
      req: request as any,
      secret,
      cookieName: "__Secure-next-auth.session-token",
    });
  }

  // Fallback: Try secure authjs cookie name (NextAuth v5 default)
  if (!token) {
    token = await getToken({
      req: request as any,
      secret,
      cookieName: "__Secure-authjs.session-token",
    });
  }

  // Fallback: Try non-secure cookie name explicitly
  if (!token) {
    token = await getToken({
      req: request as any,
      secret,
      cookieName: "next-auth.session-token",
    });
  }

  // Fallback: Try non-secure authjs cookie name
  if (!token) {
    token = await getToken({
      req: request as any,
      secret,
      cookieName: "authjs.session-token",
    });
  }

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
      } else if ((role === "admin" || role === "manager" || role === "cashier") && isActive) {
        target = "/dashboard";
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
    if ((role === "admin" || role === "manager" || role === "cashier") && isActive) return redirectTo("/dashboard");
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
      return (role === "admin" || role === "manager" || role === "cashier") && isActive ? redirectTo("/dashboard") : redirectTo("/");
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
