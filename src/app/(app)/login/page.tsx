// src/app/(app)/login/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import LoginForm from "../_components/loginForm";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { decodeToken } from "@/lib/decodeToken";

// 🔁 Apenas no client
const ForceLogout = dynamic(() => import("../_components/ForceLogout"), { ssr: false });

export default async function LoginPage({ searchParams }: { searchParams?: { user?: string } }) {
  const urlUser = searchParams?.user?.toUpperCase();
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const user = token ? decodeToken(token) : null;

  console.log("🔥 Entrando na LoginPage");
  console.log("🔥 Token:", token);
  console.log("🔥 URL User:", urlUser);
  console.log("🔥 User:", user);

  // 🔒 Proteção extra: se já logado e tentando acessar o login sem user → bloqueia loop
  if (user && !urlUser) {
    console.log("⛔️ Já logado e sem ?user → redirect para /dashboard");
    redirect(`${getBaseUrl()}/dashboard`);
  }

  // 🔁 Se estiver logado e acessando com o mesmo usuário, segue para o dashboard
  if (user) {
    const loggedUser = user.login?.toUpperCase();

    if (!urlUser || loggedUser === urlUser) {
      console.log("✅ Usuário autenticado corretamente → redirecionando para dashboard");
      redirect(`${getBaseUrl()}/dashboard`);
    } else {
      console.log("⚠️ Tentativa de login como outro usuário → forçando logout");
      return <ForceLogout user={urlUser || ""} />;
    }
  }

  // 🔓 Usuário não autenticado → exibe o formulário de login
  return <LoginForm defaultLogin={urlUser} />;
}
