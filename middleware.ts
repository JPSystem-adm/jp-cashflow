// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 📌 Essa função verifica se tem subdomínio ou nao
export function middleware(req: NextRequest) {
  // ✅ Obtem o host
  const host = req.headers.get("host") || "";
  // ✅ Clona a url
  const url = req.nextUrl.clone();

  // ✅ Verifica se o host é localhost
  const isLocalhost = host.includes("localhost");
  
  // ✅ Obtem o subdomínio
  const parts = host.split(".");
  const subdomain = isLocalhost
    ? parts.length === 2 // ex: jp.localhost
      ? parts[0]
      : null
    : parts.length > 2
      ? parts[0]
      : null;

  // Se não tem subdomínio ou subdomínio é 'www', manda pra home
  if (!subdomain || subdomain === "www") {
    url.pathname = "/home";
    return NextResponse.rewrite(url);
  }

  // Se tem subdomínio válido, manda para o app
  url.pathname = "/";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/((?!api|_next|.*\\..*).*)"], 
};
