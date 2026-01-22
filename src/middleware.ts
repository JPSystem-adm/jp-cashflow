// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

function getSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  const parts = hostname.split(".");

  // dev: usuario.localhost
  if (hostname.endsWith("localhost")) {
    return parts.length === 2 ? parts[0] : null;
  }

  // produção na vercel:
  // base: jp-cashflow.vercel.app (3 partes) => sem subdomínio
  // tenant: usuario.jp-cashflow.vercel.app (4 partes) => subdomínio
  if (hostname.endsWith("vercel.app")) {
    return parts.length >= 4 ? parts[0] : null;
  }

  // qualquer outro host: não assume subdomínio
  return null;
}

function isAssetOrNext(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.[a-zA-Z0-9]+$/.test(pathname) // arquivos com extensão
  );
}

// Defina aqui quais rotas são “do app”
function isAppPath(pathname: string): boolean {
  return (
    pathname === "/inicio" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/cadastros") ||
    pathname.startsWith("/lancamentos")
  );
}

function buildHostForUser(user: string, host: string): string {
  const hostname = host.split(":")[0].toLowerCase();
  const port = host.includes(":") ? host.split(":")[1] : "";

  // dev
  if (hostname.endsWith("localhost")) {
    return `${user}.localhost${port ? `:${port}` : ""}`;
  }

  // produção (vercel.app)
  if (hostname.endsWith("vercel.app")) {
    // se já estiver em usuario.jp-cashflow.vercel.app, mantém base jp-cashflow.vercel.app
    // se estiver em jp-cashflow.vercel.app, idem
    const base = hostname.endsWith("jp-cashflow.vercel.app")
      ? "jp-cashflow.vercel.app"
      : hostname.split(".").slice(-3).join("."); // fallback: pega "vercel.app" + algo? (seguro)

    // melhor: forçar explicitamente o base do seu projeto:
    return `${user}.jp-cashflow.vercel.app${port ? `:${port}` : ""}`;
  }

  return hostname;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (isAssetOrNext(pathname)) return NextResponse.next();

  const host = req.headers.get("host") ?? "";
  const subdomain = getSubdomain(host);

  const token = req.cookies.get("token")?.value;

  // ============================
  // 1) Sem subdomínio = público
  // ============================

  // Se tentar acessar rota do APP sem subdomínio → manda pro público
  if (!subdomain && isAppPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Se estiver em /login sem subdomínio mas com ?user= → joga pro subdomínio
  if (!subdomain && pathname === "/login") {
    const user = (searchParams.get("user") ?? "").trim().toLowerCase();
    if (user) {
      const url = req.nextUrl.clone();
      url.host = buildHostForUser(user, host);
      url.pathname = "/login";
      // mantém query (?user=...)
      return NextResponse.redirect(url);
    }
  }

  // ============================
  // 2) Com subdomínio = APP
  // ============================

  if (subdomain && subdomain !== "www") {
    // Raiz do subdomínio sempre vira /inicio
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/inicio";
      return NextResponse.redirect(url);
    }

    // Bloqueia /login com token
    if (pathname === "/login" && token) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Se quiser, você pode também impedir qualquer rota pública no subdomínio.
    // (Opcional — depende do seu projeto)
    return NextResponse.next();
  }

  // Sem subdomínio e rota pública → ok
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
