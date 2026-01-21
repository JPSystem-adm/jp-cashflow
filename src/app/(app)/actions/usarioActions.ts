// src/app/(app)/actions/usarioActions.ts
"use server";

import type { tyUsuario } from "@/types/types";

type ApiError = { error?: string; message?: string };
type NovoUsuarioOk = {
  message?: string;
  usuario?: {
    id: number;
    login: string;
    nome: string;
    email: string;
    perfil: string;
  };
};

function getApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env/.env.local");
  return v.replace(/\/$/, "");
}

export async function NovoUsuario(data: tyUsuario) {
  const apiUrl = `${getApiBaseUrl()}/api/private/users`;

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // ✅ o backend faz: login upper, email lower, senha hash e cria grupos ENTRADA/TRANSFERENCIAS
      body: JSON.stringify({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        login: data.login,
        perfil: data.perfil ?? "default",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as ApiError;
      return {
        status: 0,
        menssage: err.error || err.message || `Falha no cadastro (HTTP ${res.status})`,
      };
    }

    const ok = (await res.json()) as NovoUsuarioOk;

    return {
      status: 1,
      menssage: `Cadastro efetuado com sucesso!\nLogin: ${ok.usuario?.login ?? "-"}\nEmail: ${ok.usuario?.email ?? "-"}`,
      dados: ok,
    };
  } catch (e: unknown) {
    return {
      status: 0,
      menssage: "Erro inesperado ao cadastrar. Verifique conexão/URL da API.",
      erro: String(e),
    };
  }
}

export async function AlteraSenha(id: string, senha: string) {
  const apiUrl = `${getApiBaseUrl()}/api/public/restrita/alteraSenha`;

  // validações rápidas (evita request à toa)
  const idTrim = id.trim();
  const senhaTrim = senha.trim();

  if (!idTrim) {
    return { status: 0, menssage: "ID do usuário é obrigatório." };
  }
  if (senhaTrim.length < 6) {
    return { status: 0, menssage: "Senha deve ter pelo menos 6 caracteres." };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: idTrim, senha: senhaTrim }),
      cache: "no-store",
    });

    const data = (await res.json().catch(() => ({}))) as
      | ApiError
      | {
          id?: number;
          nome?: string;
          email?: string;
          login?: string;
          perfil?: string;
        };

    if (!res.ok) {
      return {
        status: 0,
        menssage:
          (("message" in data && typeof data.message === "string" && data.message) ||
            ("error" in data && typeof data.error === "string" && data.error) ||
            `Falha ao alterar senha (HTTP ${res.status})`),
      };
    }

    return {
      status: 1,
      menssage: "Senha alterada com sucesso!",
      dados: data,
    };
  } catch (e: unknown) {
    return {
      status: 0,
      menssage: "Erro inesperado ao alterar senha. Verifique conexão/URL da API.",
      erro: String(e),
    };
  }
}

