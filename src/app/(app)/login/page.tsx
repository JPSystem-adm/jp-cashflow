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
  reason?: string; // ex: "sem-sessao"
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const urlUser = searchParams?.user?.toUpperCase();
  const reason = searchParams?.reason;

  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // ✅ Se veio reason pedindo limpeza (ex.: /inicio detectou sessão inválida)
  // Força logout no client e mantém o user preenchido.
  if (reason === "sem-sessao") {
    return <ForceLogout user={urlUser || ""} />;
  }

  // Se tem token, NÃO confia só no decode.
  if (token) {
    // decodeToken pode ser útil pra comparar login/subdomínio, mas não valida sessão.
    const decoded = decodeToken(token);

    // Se nem decodifica, limpa cookie
    if (!decoded) {
      return <ForceLogout user={urlUser || ""} />;
    }

    // ✅ Valida sessão real na API (usuário existe? token aceito?)
    const me = await fetchMeServer(token);

    if (!me) {
      // Usuário apagado do banco / token expirado / secret diferente
      return <ForceLogout user={urlUser || ""} />;
    }

    const loggedUser = me.login.toUpperCase();

    // 🔒 Se já está logado e tentou abrir /login sem ?user, manda pro dashboard
    if (!urlUser) {
      redirect(`${getBaseUrl()}/dashboard`);
    }

    // ✅ Se o usuário do token/API bate com o ?user, dashboard
    if (loggedUser === urlUser) {
      redirect(`${getBaseUrl()}/dashboard`);
    }

    // ⚠️ Tentou logar como outro usuário/tenant: força logout
    return <ForceLogout user={urlUser || ""} />;
  }

  // 🔓 Usuário não autenticado → exibe o formulário
  return <LoginForm defaultLogin={urlUser || ""} />;
}
