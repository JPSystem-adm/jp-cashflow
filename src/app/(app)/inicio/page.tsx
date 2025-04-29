// src/app/(app)/inicio/page.tsx

import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { decodeToken } from "@/lib/decodeToken"; // 👈 Importa a função que só decodifica

function getSubdomainFromHost(host: string): string | null {
  if (!host) return null;

  const parts = host.split(":")[0].split(".");
  const isLocalhost = host.includes("localhost");

  if (isLocalhost && parts.length === 2) return parts[0];
  if (!isLocalhost && parts.length >= 3) return parts[0];
  return null;
}

async function getUserIdBySubdomain(subdomain: string): Promise<string | null> {
  console.log("🟡 Validando subdomínio:", subdomain);
  try {
    const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/public/global/autenticacao/validaSubdominio/`;
    const response = await fetch(urlAPI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: subdomain }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data?.id ?? null;
  } catch (err) {
    console.error("🚨 Erro validando subdomínio:", err);
    return null;
  }
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
    const user = decodeToken(token);

    if (user) {
      console.log("🧩 Token decodificado:", user);

      // ⚡ Se o login do token for igual ao subdomínio, redireciona pro dashboard
      if (user.login?.toUpperCase() === subdomain.toUpperCase()) {
        console.log("🟢 Token válido e subdomínio correto. Indo para o dashboard...");
        return redirect(`${getBaseUrl()}/dashboard`);
      } else {
        console.log("🔴 Token não corresponde ao subdomínio. Indo para login...");
        return redirect(`${getBaseUrl()}/login?user=${subdomain}`);
      }
    }
  }

  // Se não tiver token ou token inválido
  console.log("🔒 Usuário não logado. Redirecionando para login...");
  return redirect(`${getBaseUrl()}/login?user=${subdomain}`);
}
