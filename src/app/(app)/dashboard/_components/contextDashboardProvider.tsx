// src/app/(app)/dashboard/_components/contextDashboardProvider.tsx
"use client";

import React, { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { useGlobalContext } from "@/app/(app)/contextGlobal";
import {
  RetEstatisticaDespesas,
  RetEstatisticaEntradas,
  ListaDespesasPeriodo,
  ListaSubContasPorContas,
  RetSomatoriasPeriodo,
} from "@/app/(app)/actions/graficosActions";

import type {
  tyDespesaGrafico,
  tyEntradasGrafico,
  tySubGruposGrafico,
  tySelects,
  tySomatoriasPeriodo,
} from "@/types/types";

type DashboardContextValue = {
  // dados
  despesas: tyDespesaGrafico[];
  entradas: tyEntradasGrafico[];
  subContas: tySubGruposGrafico[];
  gruposDespesas: tySelects[];
  somatoriasFontes: tySomatoriasPeriodo[];

  // estado do filtro
  grupoId: number;
  setGrupoId: (id: number) => void;

  // kpis calculados
  kpis: {
    totalDespesas: number;
    totalReceitas: number;
    saldoPeriodo: number; // receitas - despesas
    totalCartoes: number; // Tipo "C"
    totalDisponivel: number; // Tipo "M"
    totalInvestimentos: number; // Tipo "A"
  };

  // loading
  loading: {
    despesas: boolean;
    entradas: boolean;
    grupos: boolean;
    subContas: boolean;
    somatorias: boolean;
  };
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function toNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function sumBy<T>(arr: T[], pick: (x: T) => unknown): number {
  return arr.reduce((acc, cur) => acc + toNumber(pick(cur)), 0);
}

function sumSomatoriasByTipo(arr: tySomatoriasPeriodo[], tipo: string): number {
  return arr
    .filter((x) => String(x.Tipo ?? "") === tipo)
    .reduce((acc, cur) => acc + toNumber(cur.saldoAtual), 0);
}

type ProviderProps = { children: ReactNode };

export function DashboardProvider({ children }: ProviderProps) {
  const { periodoId } = useGlobalContext();

  const [grupoId, setGrupoId] = React.useState<number>(0);

  const qDespesas = useQuery({
    queryKey: ["dash", "despesas", periodoId],
    enabled: !!periodoId,
    queryFn: async () => RetEstatisticaDespesas(periodoId),
    staleTime: 30_000,
  });

  const qEntradas = useQuery({
    queryKey: ["dash", "entradas", periodoId],
    enabled: !!periodoId,
    queryFn: async () => RetEstatisticaEntradas(periodoId),
    staleTime: 30_000,
  });

  const qSomatorias = useQuery({
    queryKey: ["dash", "somatorias", periodoId],
    enabled: !!periodoId,
    queryFn: async () => RetSomatoriasPeriodo(periodoId, "GERAL"),
    staleTime: 30_000,
  });

  const qGrupos = useQuery({
    queryKey: ["dash", "grupos-despesas", periodoId],
    enabled: !!periodoId,
    queryFn: async () => ListaDespesasPeriodo(periodoId),
    staleTime: 30_000,
  });

  const qSubContas = useQuery({
    queryKey: ["dash", "subcontas", periodoId, grupoId],
    enabled: !!periodoId && grupoId > 0, // só busca quando escolher um grupo
    queryFn: async () => ListaSubContasPorContas(periodoId, grupoId),
    staleTime: 30_000,
  });

  const despesas = (qDespesas.data ?? []) as tyDespesaGrafico[];
  const entradas = (qEntradas.data ?? []) as tyEntradasGrafico[];
  const somatoriasFontes = (qSomatorias.data ?? []) as tySomatoriasPeriodo[];
  const gruposDespesas = (qGrupos.data ?? []) as tySelects[];
  const subContas = (qSubContas.data ?? []) as tySubGruposGrafico[];

  const kpis = useMemo(() => {
    const totalDespesas = sumBy(despesas, (x) => x.valorReal);
    const totalReceitas = sumBy(entradas, (x) => x.valorReal);
    const saldoPeriodo = totalReceitas - totalDespesas;

    const totalCartoes = sumSomatoriasByTipo(somatoriasFontes, "C");
    const totalDisponivel = sumSomatoriasByTipo(somatoriasFontes, "M");
    const totalInvestimentos = sumSomatoriasByTipo(somatoriasFontes, "A");

    return {
      totalDespesas,
      totalReceitas,
      saldoPeriodo,
      totalCartoes,
      totalDisponivel,
      totalInvestimentos,
    };
  }, [despesas, entradas, somatoriasFontes]);

  const value: DashboardContextValue = {
    despesas,
    entradas,
    subContas,
    gruposDespesas,
    somatoriasFontes,

    grupoId,
    setGrupoId,

    kpis,

    loading: {
      despesas: qDespesas.isLoading,
      entradas: qEntradas.isLoading,
      grupos: qGrupos.isLoading,
      subContas: qSubContas.isLoading,
      somatorias: qSomatorias.isLoading,
    },
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardContext deve ser usado dentro de DashboardProvider");
  return ctx;
}
