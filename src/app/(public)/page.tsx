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

/* ======================================================
   Utils
====================================================== */
function sanitizeTenant(input: string): string {
  const s = input.trim().toLowerCase();
  const noAccents = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dashed = noAccents.replace(/[\s_]+/g, "-");
  const cleaned = dashed.replace(/[^a-z0-9-]/g, "");
  return cleaned.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

function getLoginRedirectUrl(tenant: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  // ✅ tenant no PATH (padrão oficial do projeto)
  return `${origin}/${tenant}/login?user=${encodeURIComponent(tenant)}`;
}

/* ======================================================
   UI helpers
====================================================== */
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
        <div>
          <h3 className="text-lg font-semibold text-sky-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-[6px] h-2 w-2 rounded-full bg-sky-700" />
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
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
            {icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-sky-950">
                {title}
              </h3>
              {badge && (
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800 border border-sky-100">
                  {badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
        </div>

        <span className="text-sky-800 text-sm font-semibold">
          Ver <ArrowRight className="inline-block h-4 w-4 ml-1" />
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-500 break-all">{href}</p>
    </a>
  );
}

/* ======================================================
   Page
====================================================== */
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
    window.location.href = getLoginRedirectUrl(clean);
  }

  function handleCriarConta() {
    // ✅ novo caminho oficial do cadastro
    router.push("/cadastros/usuarios/cadastro");
  }

  return (
    <main className="min-h-dvh bg-white">
      {/* Topbar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-900 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-sky-950">JP CashFlow</div>
              <div className="text-xs text-slate-500">
                Controle financeiro simples
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleEntrar}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-slate-100"
            >
              Entrar
            </button>
            <button
              onClick={handleCriarConta}
              className="rounded-xl bg-sky-900 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
            >
              Criar conta
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-extrabold text-sky-950">
          Bem-vindo ao JP CashFlow
        </h1>

        <p className="mt-3 text-slate-600">
          Digite seu login para acessar diretamente seu ambiente.
        </p>

        <div className="mt-6 max-w-md rounded-3xl border p-4">
          <label className="text-xs font-semibold text-slate-600">
            Login (usuário/empresa)
          </label>

          <div className="mt-1 flex gap-2">
            <input
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              placeholder="ex: jpsystem"
              className="flex-1 rounded-xl border px-3 py-2"
            />
            <button
              onClick={handleEntrar}
              className="rounded-xl bg-sky-900 px-4 py-2 text-white"
            >
              Entrar
            </button>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-700">{error}</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-6">
        <div className="mx-auto max-w-6xl px-4 flex justify-between text-sm text-slate-600">
          <span>© {year} JPSystem</span>
          <button onClick={handleCriarConta} className="hover:underline">
            Criar conta
          </button>
        </div>
      </footer>
    </main>
  );
}
