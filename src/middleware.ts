// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/cadastro", "/unauthorized"];

// rotas que NÃO podem ser tenant
const RESERVED_FIRST_SEGMENTS = new Set<string>([
  // públicas
  "login",
  "cadastro",
  "unauthorized",
  "about",

  // app (sem tenant)
  "inicio",
  "dashboard",
  "cadastros",
  "lancamentos",
  "agendamentos",
]);

function isAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function isValidTenant(value: string): boolean {
  return /^[a-z0-9-]+$/i.test(value);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isAsset(pathname)) return NextResponse.next();

  const segments = pathname.split("/").filter(Boolean);

  // 🔹 Sem segmento => /
  if (segments.length === 0) return NextResponse.next();

  const first = segments[0];

  // 🔹 Rotas públicas sem tenant
  if (PUBLIC_ROUTES.includes(`/${first}`)) return NextResponse.next();

  // ✅ Se começar com rota reservada, NÃO é tenant
  if (RESERVED_FIRST_SEGMENTS.has(first)) return NextResponse.next();

  // 🔹 Tenant é o primeiro segmento
  const tenant = first;

  if (!isValidTenant(tenant)) return NextResponse.next();

  const restPath = `/${segments.slice(1).join("/")}`;

  const isAppRoute =
    restPath === "/" ||
    restPath === "" ||
    restPath.startsWith("/inicio") ||
    restPath.startsWith("/dashboard") ||
    restPath.startsWith("/cadastros") ||
    restPath.startsWith("/lancamentos") ||
    restPath.startsWith("/agendamentos") ||
    restPath.startsWith("/about") ||
    restPath.startsWith("/login") ||        // ✅ add
    restPath.startsWith("/cadastro");       // ✅ se existir no app  

  if (!isAppRoute) return NextResponse.next();

  const url = req.nextUrl.clone();

  url.pathname = restPath === "/" || restPath === "" ? "/inicio" : restPath;

  const res = NextResponse.rewrite(url);

  res.cookies.set("tenant", tenant.toLowerCase(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return res;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
