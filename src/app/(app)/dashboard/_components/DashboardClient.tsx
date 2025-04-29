// src/app/(app)/dashboard/_components/DashboardClient.tsx
"use client";

import CardConta from "./cardConta";
import { DashboardProvider } from "./contextDashboardProvider";
import GraficoBarDespesas from "./graficoBarDespesas";
import GraficoPizzaEntradas from "./graficoPizzaEntradas";
import GraficoBarSubContas from "./graficoBarSubContas";
import SelectContas from "./selectContas";

export default function DashboardClient() {
  return (
    <DashboardProvider>
      <div className="flex flex-row h-[60%] w-[95%] max-w-[1600px] min-w-[600px] min-h-[500px] items-center px-4 py-0 pb-16">
        <div className="flex flex-col justify-between h-full w-full m-4 py-0">
          {/* Título */}
          <div className="flex flex-col w-full mb-6 justify-center">
            <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-2xl text-center text-sky-900 py-0">
              Dashboard
            </h1>
            <p className="text-sm md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-sky-800 text-center">
              Painel de Estatísticas do Período.
            </p>
          </div>

          {/* Conteúdo */}
          <div className="flex flex-row w-full align-middle">
            {/* Lado Esquerdo */}
            <div className="flex flex-col justify-center align-middle w-full mr-6">
              <div className="flex flex-col justify-center mb-10 border-2 border-gray-200 rounded-md shadow-lg p-8">
                <GraficoBarDespesas />
              </div>
              <div className="flex flex-row justify-between mb-14">
                <div className="flex flex-col justify-center w-[45%] min-w-80 border-2 border-gray-200 rounded-md shadow-lg p-8">
                  <GraficoPizzaEntradas />
                </div>
                <div className="flex flex-col justify-center w-[45%] min-w-80 border-2 border-gray-200 rounded-md shadow-lg p-2">
                  <SelectContas />
                  <GraficoBarSubContas />
                </div>
              </div>
            </div>

            {/* Lado Direito */}
            <div className="flex flex-col flex-wrap w-[500px] mb-10 h-full p-2 rounded-md shadow-lg items-center justify-start">
              <div className="flex w-full mb-10 rounded-md shadow-lg p-2">
                <CardConta icone="despesas.png" conta="Despesas" />
              </div>
              <div className="flex w-full mb-10 rounded-md shadow-lg p-2">
                <CardConta icone="receitas.png" conta="Receitas" />
              </div>
              <div className="flex w-full mb-10 rounded-md shadow-lg p-2">
                <CardConta icone="receitas.png" conta="Cartões de crédito" />
              </div>
              <div className="flex w-full mb-10 rounded-md shadow-lg p-2">
                <CardConta icone="saldo.png" conta="Saldo disponível" />
              </div>
              <div className="flex w-full mb-10 rounded-md shadow-lg p-2">
                <CardConta icone="investimento.png" conta="Investimentos" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}
