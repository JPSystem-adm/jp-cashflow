// src/app/app/login/page.tsx

import { getServerSession } from "next-auth";
import { auth as authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import LoginForm from "../_components/loginForm";
import dynamic from "next/dynamic";

// 🟡 Carrega o ForceLogout só no client (evita erro de hydration)
const ForceLogout = dynamic(() => import("../_components/ForceLogout"), { ssr: false });


export default async function LoginPage({ searchParams }: { searchParams?: { user?: string } }) {
  const session = await getServerSession(authOptions);
  const urlUser = searchParams?.user?.toUpperCase();

  // 1️⃣ Se não veio "user" na URL, manda sempre pra /home
  if (!urlUser) {
    redirect("/home");
  }

  // 2️⃣ Se estiver logado...
  if (session?.user) {
    const loggedUser = session.user?.nickname?.toUpperCase();

    if (loggedUser === urlUser) {
      // 2a. Logado com o mesmo user → manda pro /dashboard
      redirect("/app/dashboard");
    } else {
      // 2b. Logado com user diferente → derruba a sessão
      return <ForceLogout user={urlUser} />;
    }
  }

  // 3️⃣ Se não estiver logado, mostra o login com o usuário preenchido
  return <LoginForm defaultLogin={urlUser} />;
}
