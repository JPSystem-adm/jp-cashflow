// src/app/(public)/cadastro/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ErrorResponse = { error?: string; erro?: string; message?: string };

function getApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env/.env.local");
  return v.replace(/\/$/, "");
}

function sanitizeTenant(input: string): string {
  const s = input.trim().toLowerCase();
  const noAccents = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dashed = noAccents.replace(/[\s_]+/g, "-");
  const cleaned = dashed.replace(/[^a-z0-9-]/g, "");
  return cleaned.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function getLoginRedirectUrl(tenant: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const host = typeof window !== "undefined" ? window.location.host : "localhost:3000";

  // DEV: subdomínio em localhost
  if (isDev) {
    return `http://${tenant}.localhost:3000/login?user=${encodeURIComponent(tenant)}`;
  }

  // PROD: usa domínio base do host atual
  const parts = host.split(":")[0].split(".");
  const domainBase = parts.length >= 2 ? parts.slice(-2).join(".") : host.split(":")[0];

  return `https://${tenant}.${domainBase}/login?user=${encodeURIComponent(tenant)}`;
}

type CreateUserResponse = {
  message?: string;
  usuario?: {
    id: number;
    login: string;
    nome: string;
    email: string;
    perfil: "admin" | "default" | "plus" | "premium";
  };
};

export default function PublicCadastroPage() {
  const router = useRouter();
  const year = useMemo(() => new Date().getFullYear(), []);

  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    const cleanLogin = sanitizeTenant(login);

    if (!nome.trim()) return setMsg("Informe seu nome.");
    if (!cleanLogin) return setMsg("Informe um login válido (ex: jpsystem).");
    if (!email.trim()) return setMsg("Informe seu e-mail.");
    if (!senha.trim() || senha.trim().length < 4) {
      return setMsg("Informe uma senha (mín. 4 caracteres).");
    }

    setLoading(true);

    try {
      const api = getApiBaseUrl();

      // ✅ Endpoint REAL da sua API publicada (público para criar usuário)
      const res = await fetch(`${api}/api/private/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          // API faz: login->UPPER / email->lower / senha hash / cria grupos padrão
          nome: nome.trim(),
          email: email.trim(),
          senha: senha.trim(),
          login: cleanLogin, // pode mandar minúsculo que a API normaliza
          perfil: "default",
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as
        | CreateUserResponse
        | ErrorResponse;

      if (!res.ok) {
        const err = payload as ErrorResponse;
        const m =
          err.error ||
          err.erro ||
          err.message ||
          `Falha ao cadastrar usuário (HTTP ${res.status}).`;
        setMsg(m);
        return;
      }

      const ok = payload as CreateUserResponse;

      // ✅ Depois de cadastrar, manda pro login do SUBDOMÍNIO já com ?user=
      // (mantendo o fluxo que você quer)
      const target = getLoginRedirectUrl(cleanLogin);
      window.location.href = target;
    } catch (error: unknown) {
      console.error(error);
      setMsg("Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-900 text-white">
              <span className="text-sm font-bold">JP</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-sky-950">JP CashFlow</div>
              <div className="text-xs text-slate-500">Cadastro público</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-100 transition"
          >
            Voltar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-sky-950">
            Criar conta
          </h1>

          <p className="mt-2 text-slate-600">
            Escolha seu <b>login</b>. Ele vira seu subdomínio:{" "}
            <span className="font-semibold">login.localhost:3000</span> (dev) e{" "}
            <span className="font-semibold">login.jp-cashflow.app</span> (prod).
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-sky-950">
                Nome
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Seu nome"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-950">
                Login (subdomínio)
              </label>
              <input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="ex: jpsystem"
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-slate-500">
                Use letras e números. Sem espaço. (A gente normaliza e remove acentos.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-950">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="seuemail@dominio.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-sky-950">
                Senha
              </label>
              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="******"
                autoComplete="new-password"
              />
            </div>

            {msg ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {msg}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-sky-900 px-5 py-3 text-base font-semibold text-white hover:bg-sky-800 transition disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar conta e ir para o login"}
            </button>

            <p className="text-xs text-slate-500">© {year} JPSystem</p>
          </form>
        </div>
      </section>
    </main>
  );
}
