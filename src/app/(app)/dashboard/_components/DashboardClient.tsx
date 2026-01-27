// src/app/(app)/dashboard/_components/DashboardClient.tsx
"use client";

import { DashboardProvider, useDashboardContext } from "./contextDashboardProvider";
import GraficoBarDespesas from "./graficoBarDespesas";
import GraficoPizzaEntradas from "./graficoPizzaEntradas";
import GraficoBarSubContas from "./graficoBarSubContas";
import SelectContas from "./selectContas";
import CardConta from "./cardConta";

function buildDetalhesContas(ctx: ReturnType<typeof useDashboardContext>) {
  const { despesas, entradas, somatoriasFontes } = ctx;

  const detalhesDespesas = despesas
    .slice()
    .sort((a, b) => (b.valorReal ?? 0) - (a.valorReal ?? 0))
    .slice(0, 8)
    .map((x) => ({ titulo: x.Grupo, valor: Number(x.valorReal ?? 0) }));

  const detalhesReceitas = entradas
    .slice()
    .sort((a, b) => (b.valorReal ?? 0) - (a.valorReal ?? 0))
    .slice(0, 8)
    .map((x) => ({ titulo: x.SubGrupo, valor: Number(x.valorReal ?? 0) }));

  const detalhesPorTipo = (tipo: string) =>
    somatoriasFontes
      .filter((x) => String(x.Tipo ?? "") === tipo)
      .slice()
      .sort((a, b) => Number(b.saldoAtual ?? 0) - Number(a.saldoAtual ?? 0))
      .slice(0, 10)
      .map((x) => ({ titulo: String(x.Fonte ?? ""), valor: Number(x.saldoAtual ?? 0) }));

  return {
    detalhesDespesas,
    detalhesReceitas,
    detalhesCartoes: detalhesPorTipo("C"),
    detalhesDisponivel: detalhesPorTipo("M"),
    detalhesInvestimentos: detalhesPorTipo("A"),
  };
}

function DashboardInner() {
  const ctx = useDashboardContext();
  const { kpis, loading } = ctx;

  const detalhes = buildDetalhesContas(ctx);

  return (
    <div className="w-full">
      {/* Header compacto */}
      <header className="mb-3">
        <h1 className="text-lg sm:text-2xl font-bold text-sky-900">Dashboard</h1>
        <p className="text-sm text-sky-800/80">Resumo do período selecionado.</p>
      </header>

      {/* KPIs (mobile-first) */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="rounded-xl border bg-white p-3">
          <div className="text-xs text-slate-500">Receitas</div>
          <div className="text-base sm:text-lg font-bold text-emerald-700">
            {loading.entradas ? "..." : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalReceitas)}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-3">
          <div className="text-xs text-slate-500">Despesas</div>
          <div className="text-base sm:text-lg font-bold text-rose-700">
            {loading.despesas ? "..." : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalDespesas)}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-3 col-span-2 lg:col-span-2">
          <div className="text-xs text-slate-500">Saldo do período</div>
          <div className="text-lg sm:text-xl font-extrabold text-sky-900">
            {(loading.despesas || loading.entradas)
              ? "..."
              : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.saldoPeriodo)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Receitas − Despesas</div>
        </div>

        <div className="rounded-xl border bg-white p-3 hidden lg:block">
          <div className="text-xs text-slate-500">Disponível</div>
          <div className="text-base font-bold text-sky-900">
            {loading.somatorias ? "..." : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalDisponivel)}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-3 hidden lg:block">
          <div className="text-xs text-slate-500">Cartões</div>
          <div className="text-base font-bold text-sky-900">
            {loading.somatorias ? "..." : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalCartoes)}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-3 hidden lg:block">
          <div className="text-xs text-slate-500">Investimentos</div>
          <div className="text-base font-bold text-sky-900">
            {loading.somatorias ? "..." : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalInvestimentos)}
          </div>
        </div>
      </section>

      {/* Conteúdo principal */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 lg:gap-6">
        {/* esquerda */}
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl border bg-white p-3 sm:p-4 shadow-sm">
            <GraficoBarDespesas />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border bg-white p-3 sm:p-4 shadow-sm">
              <GraficoPizzaEntradas />
            </div>

            <div className="rounded-2xl border bg-white p-3 sm:p-4 shadow-sm">
              <div className="mb-2">
                <SelectContas />
              </div>
              <GraficoBarSubContas />
            </div>
          </div>
        </section>

        {/* direita */}
        <aside className="flex flex-col gap-3">
          <CardConta icone="receitas.png" conta="Receitas" valor={kpis.totalReceitas} detalhes={detalhes.detalhesReceitas} />
          <CardConta icone="despesas.png" conta="Despesas" valor={kpis.totalDespesas} detalhes={detalhes.detalhesDespesas} />

          <CardConta icone="saldo.png" conta="Saldo disponível" valor={kpis.totalDisponivel} detalhes={detalhes.detalhesDisponivel} />
          <CardConta icone="receitas.png" conta="Cartões de crédito" valor={kpis.totalCartoes} detalhes={detalhes.detalhesCartoes} />
          <CardConta icone="investimento.png" conta="Investimentos" valor={kpis.totalInvestimentos} detalhes={detalhes.detalhesInvestimentos} />
        </aside>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  return (
    <DashboardProvider>
      <DashboardInner />
    </DashboardProvider>
  );
}
