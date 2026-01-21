// src/app/(app)/dashboard/_components/DashboardClient.tsx
"use client";

import PageContainer from "@/app/(app)/_components/PageContainer";
import CardConta from "./cardConta";
import { DashboardProvider } from "./contextDashboardProvider";
import GraficoBarDespesas from "./graficoBarDespesas";
import GraficoPizzaEntradas from "./graficoPizzaEntradas";
import GraficoBarSubContas from "./graficoBarSubContas";
import SelectContas from "./selectContas";

export default function DashboardClient() {
  return (
    <DashboardProvider>
      <PageContainer>
        <div className="min-h-[calc(100dvh-2rem)] pb-10">
          {/* Título */}
          <header className="flex flex-col items-center justify-center gap-2 py-2 sm:py-4">
            <h1 className="text-xl font-bold tracking-tighter sm:text-2xl text-center text-sky-900">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-sky-800 text-center">
              Painel de Estatísticas do Período.
            </p>
          </header>

          {/* Conteúdo */}
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:gap-6">
            {/* COLUNA ESQUERDA (gráficos) */}
            <section className="flex flex-col gap-4">
              <div className="rounded-md border-2 border-gray-200 shadow-lg p-4 sm:p-6">
                <GraficoBarDespesas />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-md border-2 border-gray-200 shadow-lg p-4 sm:p-6">
                  <GraficoPizzaEntradas />
                </div>

                <div className="rounded-md border-2 border-gray-200 shadow-lg p-3 sm:p-4">
                  <SelectContas />
                  <div className="mt-2">
                    <GraficoBarSubContas />
                  </div>
                </div>
              </div>
            </section>

            {/* COLUNA DIREITA (cards) */}
            <aside className="rounded-md shadow-lg p-2 sm:p-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-md shadow-lg p-2">
                  <CardConta icone="despesas.png" conta="Despesas" />
                </div>
                <div className="rounded-md shadow-lg p-2">
                  <CardConta icone="receitas.png" conta="Receitas" />
                </div>
                <div className="rounded-md shadow-lg p-2">
                  <CardConta icone="receitas.png" conta="Cartões de crédito" />
                </div>
                <div className="rounded-md shadow-lg p-2">
                  <CardConta icone="saldo.png" conta="Saldo disponível" />
                </div>
                <div className="rounded-md shadow-lg p-2">
                  <CardConta icone="investimento.png" conta="Investimentos" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </PageContainer>
    </DashboardProvider>
  );
}
