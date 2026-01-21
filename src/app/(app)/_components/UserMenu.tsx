// src/app/(app)/_components/UserMenu.tsx
"use client";

import { useMemo } from "react";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import UserCircleIcon from "@/app/(app)/_components/UserCircleIcon";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Props = {
  className?: string;
};

function formatDateTimeBR(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function UserMenu({ className = "" }: Props) {
  const {
    usuarioId,
    usuarioNome,
    usuarioLogin,
    usuarioPerfil,
    usuarioEmail,
    ultimoAcessoISO,
    isLogged,
    logout,
  } = useGlobalContext();

  const acesso = useMemo(() => formatDateTimeBR(ultimoAcessoISO), [ultimoAcessoISO]);

  if (!isLogged) return null;

  const iconColor =
    usuarioPerfil !== "admin" ? "text-blue-300" : "text-green-300";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/10 transition ${className}`}
          aria-label="Abrir menu do usuário"
        >
          <UserCircleIcon className={`w-7 h-7 ${iconColor} rounded-full`} />
          <span className="hidden sm:inline text-sky-50 text-base font-medium max-w-[160px] truncate">
            {usuarioNome}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[320px] bg-white border border-slate-200 p-2"
      >
        <DropdownMenuLabel className="text-sky-900">Conta</DropdownMenuLabel>

        <Card className="p-3 border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="text-slate-700 text-sm">
              <span className="font-semibold">Nome:</span>{" "}
              <span className="break-words">{usuarioNome}</span>
            </div>

            <div className="text-slate-700 text-sm">
              <span className="font-semibold">Login:</span>{" "}
              <span className="break-words">{usuarioLogin || "-"}</span>
            </div>

            <div className="text-slate-700 text-sm">
              <span className="font-semibold">Email:</span>{" "}
              <span className="break-all">{usuarioEmail || "-"}</span>
            </div>

            <div className="text-slate-700 text-sm">
              <span className="font-semibold">Perfil:</span>{" "}
              <span className="break-words">{usuarioPerfil || "-"}</span>
            </div>

            <div className="text-slate-700 text-sm">
              <span className="font-semibold">Acesso:</span>{" "}
              <span className="break-words">{acesso}</span>
            </div>

            <div className="text-slate-500 text-xs mt-1">ID: {usuarioId}</div>
          </div>
        </Card>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="p-0">
          <Button
            type="button"
            onClick={() => logout("/login")}
            className="w-full justify-center"
            variant="destructive"
          >
            Sair
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
