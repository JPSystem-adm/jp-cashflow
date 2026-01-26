// src/app/(app)/_components/ClientDrawer.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

import {
  IconDashBoard,
  IconLancamentos,
  IconMenu,
  IconGrupoContas,
  IconContasFinanceiras,
  IconOrcamentos,
  IconSaldos,
  IconAbout,
} from "./iconsMenu";

type Props = {
  tenant?: string;
};

function normalizeTenant(value: string | undefined): string | null {
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

export default function ClientDrawer({ tenant }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();

  const t = useMemo(() => normalizeTenant(tenant), [tenant]);

  const handleLinkClick = () => setIsDrawerOpen(false);

  // ✅ Prefixa o tenant quando existir e quando você estiver no “modo tenant”
  // (Se quiser sempre prefixar quando tiver cookie, deixa assim mesmo.)
  const href = (path: string) => {
    const p = path.startsWith("/") ? path : `/${path}`;
    if (!t) return p;
    return `/${t}${p}`;
  };

  return (
    <div className="flex flex-col">
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="left">
        <DrawerTrigger asChild>
          <div className="w-10">
            <Button variant="ghost" onClick={() => setIsDrawerOpen(true)}>
              <IconMenu />
            </Button>
          </div>
        </DrawerTrigger>

        <DrawerContent className="flex flex-col h-[calc(100vh-86px)]">
          <DrawerHeader>
            <DrawerTitle className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-4xl text-amber-400 text-center">
              Menu
            </DrawerTitle>
            <DrawerDescription className="text-sm text-amber-300 px-3">
              Navegue entre as seções do aplicativo
            </DrawerDescription>
          </DrawerHeader>

          <nav className="flex flex-col py-0 bg-sky-900 text-sky-50 flex-1 justify-center mb-24">
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href={href("/dashboard")}
              onClick={handleLinkClick}
              aria-current={pathname?.includes("/dashboard") ? "page" : undefined}
            >
              <IconDashBoard className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Dashboard
              </span>
            </Link>

            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href={href("/lancamentos")}
              onClick={handleLinkClick}
              aria-current={pathname?.includes("/lancamentos") ? "page" : undefined}
            >
              <IconLancamentos className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Lançamentos
              </span>
            </Link>

            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href={href("/cadastros/grupoDeContas")}
              onClick={handleLinkClick}
              aria-current={pathname?.includes("/cadastros/grupoDeContas") ? "page" : undefined}
            >
              <IconGrupoContas className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Grupo de Contas
              </span>
            </Link>

            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href={href("/cadastros/fonte")}
              onClick={handleLinkClick}
              aria-current={pathname?.includes("/cadastros/fonte") ? "page" : undefined}
            >
              <IconContasFinanceiras className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Contas Financeiras
              </span>
            </Link>

            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href={href("/cadastros/orcamentos")}
              onClick={handleLinkClick}
              aria-current={pathname?.includes("/cadastros/orcamentos") ? "page" : undefined}
            >
              <IconOrcamentos className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Orçamentos
              </span>
            </Link>

            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href={href("/cadastros/saldos")}
              onClick={handleLinkClick}
              aria-current={pathname?.includes("/cadastros/saldos") ? "page" : undefined}
            >
              <IconSaldos className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Saldos
              </span>
            </Link>

            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href={href("/about")}
              onClick={handleLinkClick}
              aria-current={pathname?.includes("/about") ? "page" : undefined}
            >
              <IconAbout className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Sobre
              </span>
            </Link>
          </nav>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
