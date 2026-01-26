// src/app/(app)/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import LoginForm from "../_components/loginForm";
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

function normalizeTenant(value: string): string | null {
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
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  const urlUser = normalizeTenant(searchParams?.user ?? "");
  const reason = (searchParams?.reason ?? "").trim();

  const cookieTenant = normalizeTenant(cookieStore.get("tenant")?.value ?? "");

  // ✅ No caminho A: tenant verdadeiro vem do cookie setado pelo middleware.
  // Mas se chegou aqui com ?user= e ainda não existe cookie tenant,
  // redireciona para /{user}/login pra acionar o middleware e setar o cookie.
  if (urlUser && !cookieTenant) {
    redirect(`/${urlUser}/login?user=${encodeURIComponent(urlUser)}`);
  }

  // ✅ tenant final: cookie (fonte de verdade); fallback: urlUser (em caso de cookie já estar ok)
  const tenant = cookieTenant ?? urlUser;

  // Sem tenant => essa rota não faz sentido no caminho A
  if (!tenant) {
    redirect("/");
  }

  const loginUrlWithUser = `/${tenant}/login?user=${encodeURIComponent(tenant)}`;
  const dashboardUrl = `/${tenant}/dashboard`;

  // se veio motivo pedindo limpeza
  if (reason === "sem-sessao" || reason === "tenant-diferente") {
    return <ForceLogout user={tenant.toUpperCase()} />;
  }

  // Se tem token, valida sessão real na API
  if (token) {
    const decoded = decodeToken(token);

    if (!decoded) {
      return <ForceLogout user={tenant.toUpperCase()} />;
    }

    const me = await fetchMeServer(token);

    if (!me) {
      return <ForceLogout user={tenant.toUpperCase()} />;
    }

    const loggedUser = (me.login ?? "").toUpperCase();

    // ✅ se bate com tenant, manda pro dashboard do tenant
    if (loggedUser === tenant.toUpperCase()) {
      redirect(dashboardUrl);
    }

    // token de outro usuário
    return <ForceLogout user={tenant.toUpperCase()} />;
  }

  // não autenticado -> mostra form
  // IMPORTANTE: o form precisa receber tenant para navegar para /{tenant}/dashboard
  return <LoginForm tenant={tenant} defaultLogin={tenant.toUpperCase()} />;
}
