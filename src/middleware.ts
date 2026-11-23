import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar peticiones internas de Next.js y archivos estáticos (imágenes, fonts, etc.)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;
  const isLoginPage = pathname === "/login";

  // 1. Si no tiene sesión y busca entrar a cualquier página protegida -> Redirigir al Login
  if (!session && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si ya está autenticado e intenta ir a /login -> Redirigir al Dashboard
  if (session && isLoginPage) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
