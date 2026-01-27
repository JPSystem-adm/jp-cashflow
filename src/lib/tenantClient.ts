// src/lib/tenantClient.ts

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function normalizeTenant(value: string | null | undefined): string | null {
  const v = (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!v) return null;
  if (!/^[a-z0-9-]+$/i.test(v)) return null;
  return v;
}

export function withTenant(tenant: string | null, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return tenant ? `/${tenant}${p}` : p;
}
