// src/app/(app)/cabecalho/cabecalho.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import ActivityIcon from "../_components/ActivityIcon";
import Periodo from "./periodo";
import UserMenu from "@/app/(app)/_components/UserMenu";
import { useGlobalContext } from "@/app/(app)/contextGlobal";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function normalizeTenant(value: string | null): string | null {
  const v = (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!v) return null;
  if (!/^[a-z0-9-]+$/i.test(v)) return null;
  return v;
}

function withTenant(tenant: string | null, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return tenant ? `/${tenant}${p}` : p;
}

export default function Cabecalho() {
  const { usuarioNome } = useGlobalContext();
  const isLogged = !!usuarioNome;

  const tenant = useMemo(() => {
    // fonte de verdade no client: cookie setado pelo middleware
    return normalizeTenant(readCookie("tenant"));
  }, []);

  const dashboardHref = withTenant(tenant, "/dashboard");

  return (
    <header className="fixed top-0 left-0 w-full h-14 px-3 sm:px-4 bg-sky-900 border-b border-sky-950/30 text-sky-50 z-10">
      <div className="flex items-center h-full gap-2">
        {/* Logo / Nome */}
        <Link
          className="flex items-center gap-2 text-lg sm:text-xl font-semibold"
          href={dashboardHref}
        >
          <ActivityIcon className="w-6 h-6 text-sky-50" />
          <span className="text-sky-50 whitespace-nowrap">JP Cash Flow</span>
        </Link>

        {/* Empurra tudo pro lado direito */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          {isLogged && <Periodo />}
          {isLogged && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
