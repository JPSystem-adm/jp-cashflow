// src/app/(public)/page.tsx

"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  Building2,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";

function sanitizeTenant(input: string): string {
  // regra simples: letras, números e hífen. (subdomínio seguro)
  const s = input.trim().toLowerCase();
  const noAccents = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dashed = noAccents.replace(/[\s_]+/g, "-");
  const cleaned = dashed.replace(/[^a-z0-9-]/g, "");
  return cleaned.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function getLoginRedirectUrl(tenant: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const host =
    typeof window !== "undefined" ? window.location.host : "localhost:3000";

  if (isDev) {
    return `http://${tenant}.localhost:3000/login?user=${encodeURIComponent(
      tenant
    )}`;
  }

  const parts = host.split(":")[0].split(".");
  const domainBase =
    parts.length >= 2 ? parts.slice(-2).join(".") : host.split(":")[0];

  return `https://${tenant}.${domainBase}/login?user=${encodeURIComponent(
    tenant
  )}`;
}

function FeatureCard(props: {
  title: string;
  description: string;
  bullets: string[];
  icon: React.ReactNode;
}) {
  const { title, description, bullets, icon } = props;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-2 text-sky-900">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-sky-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-sky-700" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppLinkCard(props: {
  title: string;
  description: string;
  href: string;
  badge?: string;
  icon: React.ReactNode;
}) {
  const { title, description, href, badge, icon } = props;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
            {icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-sky-950 truncate">
                {title}
              </h3>
              {badge ? (
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800 border border-sky-100">
                  {badge}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
        </div>

        <span className="text-sky-800 text-sm font-semibold group-hover:translate-x-0.5 transition whitespace-nowrap">
          Ver <ArrowRight className="inline-block h-4 w-4 ml-1" />
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-500 break-all">{href}</p>
    </a>
  );
}

export default function Home() {
  const router = useRouter();

  const [tenant, setTenant] = useState("");
  const [error, setError] = useState<string | null>(null);

  const year = useMemo(() => new Date().getFullYear(), []);

  function handleEntrar() {
    const clean = sanitizeTenant(tenant);

    if (!clean) {
      setError("Informe seu login (ex: jpsystem).");
      return;
    }

    setError(null);

    const target = getLoginRedirectUrl(clean);
    window.location.href = target;
  }

  function handleCriarConta() {
    // ✅ cadastro público (sem subdomínio)
    router.push("/cadastro");
  }

  return (
    <main className="min-h-dvh bg-white">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-900 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-sky-950">JP CashFlow</div>
              <div className="text-xs text-slate-500">
                Controle financeiro simples e direto
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEntrar}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-100 transition"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={handleCriarConta}
              className="rounded-xl bg-sky-900 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800 transition"
            >
              Criar conta
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900">
                <ShieldCheck className="h-4 w-4" />
                SaaS • JPSystem
              </p>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-sky-950 sm:text-4xl">
                Bem-vindo ao JP CashFlow 👋
              </h1>

              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                Organize suas contas, registre lançamentos e acompanhe o período
                com clareza. No celular ou no computador — sem sofrimento.
              </p>

              {/* Entrada do login (tenant/subdomínio) */}
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-700">
                    <User className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="tenant"
                      className="block text-xs font-semibold text-slate-600"
                    >
                      Informe seu login (subdomínio)
                    </label>
                    <input
                      id="tenant"
                      value={tenant}
                      onChange={(e) => setTenant(e.target.value)}
                      placeholder="ex: jpsystem"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-base text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                      inputMode="text"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Isso garante que você vai direto pro seu ambiente do app.
                  </p>
                )}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleEntrar}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-900 px-5 py-3 text-base font-semibold text-white hover:bg-sky-800 transition w-full sm:w-auto"
                  >
                    Acessar o sistema <ArrowRight className="h-4 w-4" />
                  </button>

                  <Link
                    href="/cadastro"
                    className="inline-flex items-center justify-center rounded-2xl border-2 border-sky-900 px-5 py-3 text-base font-semibold text-sky-900 hover:bg-slate-50 transition w-full sm:w-auto"
                  >
                    Criar minha conta
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <Smartphone className="h-4 w-4 text-sky-900" />
                  Mobile-first
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-sky-900" />
                  Sessão por token
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <BarChart3 className="h-4 w-4 text-sky-900" />
                  Visão clara do período
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Observação: esta é a página pública (sem subdomínio). O login
                precisa do seu “usuário/empresa” pra abrir o ambiente certo.
              </p>
            </div>

            {/* Preview */}
            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <div className="h-3 w-3 rounded-full bg-slate-300" />
                  <div className="ml-2 text-xs text-slate-500">
                    Preview do app
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-44 rounded-lg bg-slate-100" />
                    <div className="h-8 w-28 rounded-lg bg-sky-900/10 border border-sky-100" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-2xl bg-slate-100" />
                    <div className="h-24 rounded-2xl bg-slate-100" />
                    <div className="col-span-2 h-28 rounded-2xl bg-slate-100" />
                  </div>

                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-sky-50 border border-sky-100 p-3">
                    <LayoutDashboard className="h-5 w-5 text-sky-900" />
                    <div className="text-sm text-slate-700">
                      Dashboard do período com cartões e gráficos
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-sky-100 blur-2xl" />
              <div className="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-amber-100 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-sky-950">
              O que dá pra fazer no JP CashFlow
            </h2>
            <p className="mt-2 text-slate-600">
              Dashboard, Lançamentos e Grupos — do jeitinho que você pediu.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Dashboard"
              description="Visão rápida do período com gráficos e cartões."
              icon={<LayoutDashboard className="h-5 w-5" />}
              bullets={[
                "Resumo por contas e categorias",
                "Gráficos (despesas / entradas)",
                "Leitura fácil no celular",
              ]}
            />

            <FeatureCard
              title="Lançamentos"
              description="Registrar e consultar tudo com filtros."
              icon={<CreditCard className="h-5 w-5" />}
              bullets={[
                "Filtros por conta, subconta e fonte",
                "Tabela com ações rápidas",
                "Exportação quando necessário",
              ]}
            />

            <FeatureCard
              title="Grupos de contas"
              description="Seu plano de contas organizado e consistente."
              icon={<Boxes className="h-5 w-5" />}
              bullets={[
                "Criar/editar grupos e subgrupos",
                "Organização para o financeiro ficar limpo",
                "Base para relatórios mais inteligentes",
              ]}
            />
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleEntrar}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-900 px-5 py-3 text-base font-semibold text-white hover:bg-sky-800 transition w-full sm:w-auto"
            >
              Entrar <ArrowRight className="h-4 w-4" />
            </button>

            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-sky-900 px-5 py-3 text-base font-semibold text-sky-900 hover:bg-white transition w-full sm:w-auto"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>

      {/* Outros apps */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-2xl font-bold text-sky-950">
              Outros projetos da JPSystem
            </h2>
            <p className="mt-1 text-slate-600">
              Dá uma olhada também nesses dois.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <AppLinkCard
              title="Site JPSystem"
              description="Conteúdo, notícias e presença institucional."
              href="https://www.jpsystem.com.br"
              badge="Site"
              icon={<Building2 className="h-5 w-5" />}
            />

            <AppLinkCard
              title="Turma do Sansão"
              description="App com historinhas, atividades e conteúdo infantil."
              href="https://turmadosansao.app.br"
              badge="App"
              icon={<BookOpenCheck className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">© {year} JPSystem • JP CashFlow</p>

            <div className="flex gap-4 text-sm">
              <button
                type="button"
                onClick={handleEntrar}
                className="text-sky-900 hover:underline"
              >
                Entrar
              </button>

              <Link href="/cadastro" className="text-sky-900 hover:underline">
                Criar conta
              </Link>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Dica: esta é a página pública (sem subdomínio). Quando o usuário
            entrar no app, o cabeçalho e o menu assumem.
          </div>
        </div>
      </footer>
    </main>
  );
}
