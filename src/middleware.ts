// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/unauthorized"];

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isAsset(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);

  // 🔹 Caso 1: sem tenant (rota pública)
  if (segments.length === 0 || PUBLIC_ROUTES.includes(`/${segments[0]}`)) {
    return NextResponse.next();
  }

  const tenant = segments[0];
  const restPath = `/${segments.slice(1).join("/")}`;

  // 🔹 Validação simples do nome do tenant
  if (!/^[a-z0-9-]+$/i.test(tenant)) {
    return NextResponse.next();
  }

  // 🔹 Mapeamento de rotas válidas do APP
  const isAppRoute =
    restPath === "/" ||
    restPath === "" ||
    restPath.startsWith("/inicio") ||
    restPath.startsWith("/dashboard") ||
    restPath.startsWith("/cadastros") ||
    restPath.startsWith("/lancamentos") ||
    restPath.startsWith("/agendamentos");

  if (!isAppRoute) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();

  // /tenant → /inicio
  url.pathname = restPath === "/" || restPath === ""
    ? "/inicio"
    : restPath;

  const res = NextResponse.rewrite(url);

  // 🔐 Salva o tenant
  res.cookies.set("tenant", tenant, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
