// src/lib/getToken.ts
"use client";

/**
 * Recupera o token JWT salvo no cookie "token".
 * Retorna null se não existir ou se estiver inválido.
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const tokenPair = cookies.find((c) => c.startsWith("token="));

  if (!tokenPair) return null;

  const rawValue = tokenPair.slice("token=".length);
  const token = decodeURIComponent(rawValue).trim();

  // Proteções importantes
  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return null;
  }

  return token;
}
