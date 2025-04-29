// src/app/app/_components/ForceLogout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "../contextGlobal";

export default function ForceLogout({ user }: { user: string }) {
  const router = useRouter();
  const {
    setUsuarioId,
    setUsuarioLogin,
    setUsuarioNome,
    setUsuarioPerfil,
    setEmailVerificacao,
    setCodigoVerificacao,
  } = useGlobalContext();

  useEffect(() => {
    // 🧹 Limpa o cookie
    document.cookie = "token=; Max-Age=0; path=/";

    // 🧹 Limpa o contexto global
    setUsuarioId(0);
    setUsuarioLogin("");
    setUsuarioNome("");
    setUsuarioPerfil("");
    setEmailVerificacao("");
    setCodigoVerificacao("");

    // 🔁 Redireciona para login com o user na URL
    router.replace(`/login?user=${user}`);
  }, [user]);

  return null;
}
