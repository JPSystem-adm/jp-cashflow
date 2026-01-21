// src/app/(app)/lancamentos/_components/contextLancamentoProvider.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useMemo, useState } from "react";
import type { tyLancamento } from "@/types/types";
import type { OperacaoLancamento } from "@/app/(app)/actions/lancamentoAPI";

type LancamentoContextValue = {
  dados: tyLancamento[];
  setDados: React.Dispatch<React.SetStateAction<tyLancamento[]>>;

  // filtros
  grupoId: number;
  setGrupoId: React.Dispatch<React.SetStateAction<number>>;
  subGrupoId: number;
  setSubGrupoId: React.Dispatch<React.SetStateAction<number>>;
  fonteId: number;
  setFonteId: React.Dispatch<React.SetStateAction<number>>;

  // form
  formGrupoId: number;
  setFormGrupoId: React.Dispatch<React.SetStateAction<number>>;
  formSubGrupoId: number;
  setFormSubGrupoId: React.Dispatch<React.SetStateAction<number>>;
  formFonteIdO: number;
  setFormFonteIdO: React.Dispatch<React.SetStateAction<number>>;
  formFonteIdD: number | null;
  setFormFonteIdD: React.Dispatch<React.SetStateAction<number | null>>;

  operacao: OperacaoLancamento;
  setOperacao: React.Dispatch<React.SetStateAction<OperacaoLancamento>>;
};

const LancamentoContext = createContext<LancamentoContextValue | null>(null);

export function LancamentoProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<tyLancamento[]>([]);

  // filtros
  const [grupoId, setGrupoId] = useState<number>(0);
  const [subGrupoId, setSubGrupoId] = useState<number>(0);
  const [fonteId, setFonteId] = useState<number>(0);

  // form
  const [formGrupoId, setFormGrupoId] = useState<number>(0);
  const [formSubGrupoId, setFormSubGrupoId] = useState<number>(0);
  const [formFonteIdO, setFormFonteIdO] = useState<number>(0);
  const [formFonteIdD, setFormFonteIdD] = useState<number | null>(null);

  // operação normalizada no frontend:
  // - "T" => transferência (2 fontes)
  // - "M" => movimentação (D/C da API)
  const [operacao, setOperacao] = useState<OperacaoLancamento>("M");

  const value = useMemo<LancamentoContextValue>(
    () => ({
      dados,
      setDados,

      grupoId,
      setGrupoId,
      subGrupoId,
      setSubGrupoId,
      fonteId,
      setFonteId,

      formGrupoId,
      setFormGrupoId,
      formSubGrupoId,
      setFormSubGrupoId,
      formFonteIdO,
      setFormFonteIdO,
      formFonteIdD,
      setFormFonteIdD,

      operacao,
      setOperacao,
    }),
    [
      dados,
      grupoId,
      subGrupoId,
      fonteId,
      formGrupoId,
      formSubGrupoId,
      formFonteIdO,
      formFonteIdD,
      operacao,
    ]
  );

  return <LancamentoContext.Provider value={value}>{children}</LancamentoContext.Provider>;
}

export function useLancamentoContext(): LancamentoContextValue {
  const ctx = useContext(LancamentoContext);
  if (!ctx) {
    throw new Error("useLancamentoContext deve ser usado dentro de LancamentoProvider");
  }
  return ctx;
}
