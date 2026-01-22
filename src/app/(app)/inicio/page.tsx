// src/app/(app)/inicio/page.tsx
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getBaseUrl } from "@/lib/getBaseUrl";

type ValidaTenantResponse = { id?: string | number };

function tenantFromPathname(pathname: string): string | null {
  const seg = pathname.split("/").filter(Boolean)[0] ?? null;
  if (!seg) return null;

  // não aceitar rotas “reservadas” como tenant
  const reserved = new Set([
    "login",
    "cadastro",
    "unauthorized",
    "about",
    "inicio",
    "dashboard",
    "cadastros",
    "lancamentos",
    "agendamentos",
  ]);

  if (reserved.has(seg)) return null;
  if (!/^[a-z0-9-]+$/i.test(seg)) return null;

  return seg.toLowerCase();
}

async function getUserIdByTenant(tenant: string): Promise<string | null> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_BASEURL_API;
    if (!apiBase) return null;

    const urlAPI = `${apiBase}/api/public/global/autenticacao/validaSubdominio/`;
    const response = await fetch(urlAPI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: tenant }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as ValidaTenantResponse;
    const id = data?.id;

    if (typeof id === "number") return String(id);
    if (typeof id === "string" && id.trim()) return id;

    return null;
  } catch {
    return null;
  }
}

type MeResponse = {
  usuario?: { id: number; login: string; nome: string; perfil: string; email?: string };
};

async function validateSessionWithApi(token: string): Promise<MeResponse["usuario"] | null> {
  const apiBase = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!apiBase) return null;

  const res = await fetch(`${apiBase}/api/private/restrita/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) return null;

  const data = (await res.json()) as MeResponse;
  return data.usuario ?? null;
}

export default async function Page() {
  const h = headers();
  const pathname = h.get("x-pathname") ?? ""; // pode não existir
  // fallback seguro: usar o referer se tiver (dev); se não tiver, cai em redirect abaixo
  const referer = h.get("referer") ?? "";
  const pathFromReferer = (() => {
    try {
      return referer ? new URL(referer).pathname : "";
    } catch {
      return "";
    }
  })();

  const tenant = tenantFromPathname(pathFromReferer || pathname);

  if (!tenant) {
    return redirect(`${getBaseUrl()}/`);
  }

  // valida tenant na API (reusa endpoint atual)
  const userId = await getUserIdByTenant(tenant);
  if (!userId) {
    return redirect(`${getBaseUrl()}/`);
  }

  const token = cookies().get("token")?.value;

  // não logado => manda pro login DO TENANT (URL pública)
  if (!token) {
    return redirect(`${getBaseUrl()}/${tenant}/login?user=${tenant}`);
  }

  const me = await validateSessionWithApi(token);

  // token inválido => manda pro login DO TENANT
  if (!me) {
    return redirect(`${getBaseUrl()}/${tenant}/login?user=${tenant}&reason=sem-sessao`);
  }

  // login do token precisa bater com tenant
  if (me.login?.toUpperCase() !== tenant.toUpperCase()) {
    return redirect(`${getBaseUrl()}/${tenant}/login?user=${tenant}&reason=tenant-diferente`);
  }

  // ✅ sempre com tenant no path (URL pública)
  return redirect(`${getBaseUrl()}/${tenant}/dashboard`);
}
