// src/app/(app)/lancamentos/page.tsx
"use client";

import { useState } from "react";

import PageContainer from "@/app/(app)/_components/PageContainer";
import { Button } from "@/components/ui/button";

import TabelaLancamentos from "./_components/tabelaLancamentos";
import { LancamentoProvider } from "./_components/contextLancamentoProvider";
import PainelFiltros from "./_components/painelFiltros";
import LancamentosForm from "./_components/LancamentosForm";

export default function LancamentosPage() {
  const [openNovo, setOpenNovo] = useState(false);

  return (
    <LancamentoProvider>
      <PageContainer className="flex flex-col gap-4 sm:gap-5">
        <header className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tighter text-center text-sky-900">
            Lançamentos
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-sky-800 text-center">
            Gerenciar os lançamentos para o controle financeiro
          </p>
        </header>

        {/* Painel de filtros */}
        <PainelFiltros />

        {/* Ações */}
        <div className="flex items-center justify-end">
          <Button
            className="bg-sky-800 text-white hover:bg-sky-900"
            onClick={() => setOpenNovo(true)}
          >
            + Lançamento
          </Button>
        </div>

        {/* Tabela: rolagem horizontal apenas aqui */}
        <div className="w-full overflow-x-auto">
          <TabelaLancamentos />
        </div>

        {/* Modal do novo lançamento */}
        <LancamentosForm open={openNovo} onOpenChange={setOpenNovo} />
      </PageContainer>
    </LancamentoProvider>
  );
}
