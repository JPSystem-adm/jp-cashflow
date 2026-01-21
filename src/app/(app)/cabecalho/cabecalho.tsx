// src/app/(app)/cabecalho/cabecalho.tsx
"use client";

import Link from "next/link";
import ActivityIcon from "../_components/ActivityIcon";
import Periodo from "./periodo";
import UserMenu from "@/app/(app)/_components/UserMenu";

import { useGlobalContext } from "@/app/(app)/contextGlobal";

export default function Cabecalho() {
  const { usuarioNome } = useGlobalContext();
  const isLogged = !!usuarioNome;

  return (
    <header className="fixed top-0 left-0 w-full h-14 px-3 sm:px-4 bg-sky-900 border-b border-sky-950/30 text-sky-50 z-10">
      <div className="flex items-center h-full gap-2">
        {/* Logo / Nome */}
        <Link
          className="flex items-center gap-2 text-lg sm:text-xl font-semibold"
          href="/dashboard"
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
