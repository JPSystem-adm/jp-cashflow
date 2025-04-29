// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const isLocalhost = hostname.includes("localhost");
  const parts = hostname.split(".");

  const subdomain = isLocalhost && parts.length === 2
    ? parts[0]
    : !isLocalhost && parts.length >= 3
      ? parts[0]
      : null;

  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const token = request.cookies.get("token")?.value;

  console.log("🌐 Middleware | pathname:", pathname);

  // ✅ Subdomínio detectado
  if (subdomain && subdomain !== "www") {
    console.log("🔐 Middleware - Subdomínio detectado:", subdomain);

    // Redireciona raiz para /inicio
    if (pathname === "/") {
      url.pathname = "/inicio";
      console.log("🔐 Redirecionando de / para /inicio");
      return NextResponse.rewrite(url);
    }

    // 🚫 Bloqueia acesso ao /login se já tiver token
    if (pathname === "/login" && token) {
      url.pathname = "/dashboard";
      console.log("⛔️ Middleware: bloqueando /login com token → /dashboard");
      return NextResponse.redirect(url);
    }

    // 🔓 Permite outras rotas no subdomínio
    return NextResponse.rewrite(url);
  }

  console.log("🌎 Sem subdomínio, rota pública.");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"]
};
