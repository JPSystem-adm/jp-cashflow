// src/lib/getBaseUrl.ts
import { headers } from "next/headers";

export function getBaseUrl(): string {
  const h = headers();
  const host = h.get("host") ?? "localhost:3000";
  const forwardedProto = h.get("x-forwarded-proto"); // em prod costuma vir
  const protocol =
    forwardedProto ?? (process.env.NODE_ENV === "development" ? "http" : "https");

  return `${protocol}://${host}`;
}
