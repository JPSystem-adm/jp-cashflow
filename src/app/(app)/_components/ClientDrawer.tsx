"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconAgenda,
  IconCadastros,
  IconDashBoard,
  IconHome,
  IconLancamentos,
  IconMenu,
  IconGrupoContas,
  IconContasFinanceiras,
  IconOrcamentos,
  IconSaldos,
  IconAbout,
} from "./iconsMenu"; // Adicione aqui os novos ícones
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function ClientDrawer() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLinkClick = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex flex-col">
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <Drawer
        scroll-smooth
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="left"
      >
        <DrawerTrigger asChild>
          <div className="w-10">
            <Button variant="ghost" onClick={() => setIsDrawerOpen(true)}>
              <IconMenu />
            </Button>
          </div>
        </DrawerTrigger>
        <DrawerContent className="flex flex-col h-[calc(100vh-86px)]">
          <nav className="flex flex-col py-0 bg-sky-900 text-sky-50 flex-1 justify-center mb-24">
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href="/dashboard"
              onClick={handleLinkClick}
            >
              <IconDashBoard className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Dashboard
              </span>
            </Link>
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href="/lancamentos"
              onClick={handleLinkClick}
            >
              <IconLancamentos className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Lançamentos
              </span>
            </Link>
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href="/cadastros/grupoDeContas"
              onClick={handleLinkClick}
            >
              <IconGrupoContas className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Grupo de Contas
              </span>
            </Link>
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href="/cadastros/fonte"
              onClick={handleLinkClick}
            >
              <IconContasFinanceiras className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Contas Financeiras
              </span>
            </Link>
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href="/cadastros/orcamentos"
              onClick={handleLinkClick}
            >
              <IconOrcamentos className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Orçamentos
              </span>
            </Link>
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href="/cadastros/saldos"
              onClick={handleLinkClick}
            >
              <IconSaldos className="w-6 h-6 mr-3" />
              <span className="text-base xs:text-sm sm:text-lg xl:text-xl 2xl:text-2xl flex items-center">
                Saldos
              </span>
            </Link>
            <Link
              className="flex items-center w-full px-3 py-4 hover:bg-sky-800"
              href="/about"
              onClick={handleLinkClick}
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
