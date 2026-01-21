// src/app/(app)/inicio/page.tsx

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getBaseUrl } from "@/lib/getBaseUrl";

function getSubdomainFromHost(host: string): string | null {
  if (!host) return null;

  const hostname = host.split(":")[0];
  const parts = hostname.split(".");
  const isLocalhost = hostname.includes("localhost");

  // DEV: jp.localhost
  if (isLocalhost && parts.length === 2) return parts[0];

  // PROD: jp.seudominio.com
  if (!isLocalhost && parts.length >= 3) return parts[0];

  return null;
}

type ValidaSubdominioResponse = {
  id?: string | number;
};

async function getUserIdBySubdomain(subdomain: string): Promise<string | null> {
  console.log("🟡 Validando subdomínio:", subdomain);

  try {
    const apiBase = process.env.NEXT_PUBLIC_BASEURL_API;
    if (!apiBase) {
      console.error("🚨 NEXT_PUBLIC_BASEURL_API não definido.");
      return null;
    }

    const urlAPI = `${apiBase}/api/public/global/autenticacao/validaSubdominio/`;
    const response = await fetch(urlAPI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: subdomain }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as ValidaSubdominioResponse;
    const id = data?.id;

    if (typeof id === "number") return String(id);
    if (typeof id === "string" && id.trim()) return id;

    return null;
  } catch (err) {
    console.error("🚨 Erro validando subdomínio:", err);
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
  const headersList = headers();
  const host = headersList.get("host") || "";
  const subdomain = getSubdomainFromHost(host);

  console.log("🚀 Subdomínio detectado na página Inicio:", subdomain);

  if (!subdomain) {
    console.log("🔐 Subdomínio ausente. Redirecionando para a raiz.");
    return redirect(`${getBaseUrl()}/`);
  }

  const userId = await getUserIdBySubdomain(subdomain);

  if (!userId) {
    console.log("🔴 Subdomínio inválido. Redirecionando para público.");
    return redirect(`${getBaseUrl()}/`);
  }

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    const me = await validateSessionWithApi(token);

    if (me) {
      console.log("🧩 Sessão confirmada pela API:", {
        id: me.id,
        login: me.login,
        perfil: me.perfil,
      });

      // Garante que a sessão é do mesmo login do subdomínio
      if (me.login?.toUpperCase() === subdomain.toUpperCase()) {
        console.log("🟢 Sessão válida e subdomínio correto. Indo para o dashboard...");
        return redirect(`${getBaseUrl()}/dashboard`);
      }

      console.log("🔴 Sessão válida mas subdomínio diferente. Indo para login...");
      return redirect(`${getBaseUrl()}/login?user=${subdomain}`);
    }

    // Sessão inválida (token expirado/usuário apagado/etc.)
    console.log("🟠 Token existe, mas sessão inválida na API. Limpando cookie e indo para cadastro...");

    // ⚠️ Em Server Component, não dá pra apagar cookie diretamente aqui sem response.
    // Então apenas redirecionamos para uma rota que limpa cookie (recomendado),
    // ou enviamos para /login e lá limpamos no client.
    return redirect(`${getBaseUrl()}/login?user=${subdomain}&reason=sem-sessao`);
  }

  console.log("🔒 Usuário não logado. Redirecionando para login...");
  return redirect(`${getBaseUrl()}/login?user=${subdomain}`);
}
