// src/app/(app)/cadastros/saldos/_components/contextSaldosProvider.tsx

"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useMemo, useState } from "react";

import type { tySomatoriasPeriodo } from "@/app/(app)/actions/saldoAPI";

export type SaldoRow = tySomatoriasPeriodo
type SaldosContextValue = {
  rows: SaldoRow[];
  setRows: (rows: SaldoRow[]) => void;
};

const SaldosContext = createContext<SaldosContextValue | undefined>(undefined);

type Props = { children: ReactNode };

export function SaldosProvider({ children }: Props) {
  const [rows, setRows] = useState<SaldoRow[]>([]);

  const value = useMemo<SaldosContextValue>(() => ({ rows, setRows }), [rows]);

  return <SaldosContext.Provider value={value}>{children}</SaldosContext.Provider>;
}

export function useSaldoContext(): SaldosContextValue {
  const ctx = useContext(SaldosContext);
  if (!ctx) throw new Error("useSaldoContext deve ser usado dentro de SaldosProvider");
  return ctx;
}
