// src/app/(app)/inicio/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type ValidaTenantResponse = { id?: string | number };

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
  usuario?: {
    id: number;
    login: string;
    nome: string;
    perfil: string;
    email?: string;
  };
};

async function validateSessionWithApi(
  token: string
): Promise<MeResponse["usuario"] | null> {
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

function normalizeTenant(input: string): string | null {
  const t = (input ?? "").trim().toLowerCase();
  if (!t) return null;
  if (!/^[a-z0-9-]+$/i.test(t)) return null;
  return t;
}

export default async function Page() {
  const cookieStore = cookies();

  // ✅ fonte de verdade no caminho A: cookie setado pelo middleware
  const tenant = normalizeTenant(cookieStore.get("tenant")?.value ?? "");

  // Sem tenant => público
  if (!tenant) {
    redirect("/");
  }

  // ✅ valida tenant na API (reusa endpoint atual)
  const userId = await getUserIdByTenant(tenant);
  if (!userId) {
    // tenant inválido => público
    redirect("/");
  }

  const token = cookieStore.get("token")?.value;

  // não logado => manda para login do tenant (path)
  if (!token) {
    redirect(`/${tenant}/login?user=${encodeURIComponent(tenant)}`);
  }

  const me = await validateSessionWithApi(token);

  // token inválido => login do tenant com motivo
  if (!me) {
    redirect(`/${tenant}/login?user=${encodeURIComponent(tenant)}&reason=sem-sessao`);
  }

  // login do token precisa bater com tenant
  if ((me.login ?? "").toUpperCase() !== tenant.toUpperCase()) {
    redirect(`/${tenant}/login?user=${encodeURIComponent(tenant)}&reason=tenant-diferente`);
  }

  // ✅ OK
  redirect(`/${tenant}/dashboard`);
}
