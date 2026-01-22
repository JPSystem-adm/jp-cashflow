// src/app/(app)/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import LoginForm from "../_components/loginForm";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { decodeToken } from "@/lib/decodeToken";

const ForceLogout = dynamic(() => import("../_components/ForceLogout"), {
  ssr: false,
});

type SearchParams = {
  user?: string;
  reason?: string;
};

type MeResponse = {
  usuario?: {
    id: number;
    login: string;
    nome: string;
    perfil: string;
    email?: string;
  };
};

async function fetchMeServer(token: string): Promise<MeResponse["usuario"] | null> {
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

function normalizeTenant(value: string | undefined): string | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (!/^[a-z0-9-]+$/i.test(v)) return null;
  return v;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const urlUser = normalizeTenant(searchParams?.user);
  const reason = searchParams?.reason;

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // tenant preferencial: query ?user, senão cookie setado pelo middleware
  const cookieTenant = normalizeTenant(cookieStore.get("tenant")?.value);
  const tenant = urlUser ?? cookieTenant;

  const base = getBaseUrl();
  const dashboardUrl = tenant ? `${base}/${tenant}/dashboard` : `${base}/dashboard`;
  const loginUrlWithUser = tenant ? `${base}/${tenant}/login?user=${encodeURIComponent(tenant)}` : `${base}/login`;

  if (reason === "sem-sessao") {
    return <ForceLogout user={(urlUser ?? "").toUpperCase()} />;
  }

  if (token) {
    const decoded = decodeToken(token);

    if (!decoded) {
      return <ForceLogout user={(urlUser ?? "").toUpperCase()} />;
    }

    const me = await fetchMeServer(token);

    if (!me) {
      return <ForceLogout user={(urlUser ?? "").toUpperCase()} />;
    }

    const loggedUser = me.login.toUpperCase();

    // sem ?user e sem cookie tenant: manda pro dashboard “genérico”
    if (!tenant) {
      redirect(`${base}/dashboard`);
    }

    // se o tenant existe e bate com o login, manda pro dashboard do tenant
    if (tenant && loggedUser === tenant.toUpperCase()) {
      redirect(dashboardUrl);
    }

    // tentou entrar com tenant diferente
    return <ForceLogout user={(urlUser ?? "").toUpperCase()} />;
  }

  // não autenticado -> mostra form (o form vai empurrar para /{tenant}/dashboard)
  return <LoginForm defaultLogin={(urlUser ?? "").toUpperCase()} />;
}
