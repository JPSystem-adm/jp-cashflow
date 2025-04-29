// src/lib/getToken.ts
"use client";

// Lê o token do cookie
export function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
  return match ? match[2] : null;
}
