// src/app/dashboard/_components/contextDashboardProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tyDespesaGrafico, tyEntradasGrafico, tySubGruposGrafico } from "@/types/types"

interface AppContextProps {
  dadosBarDespesas: tyDespesaGrafico[];
  setDadosBarDespesas: (data: tyDespesaGrafico[]) => void;
  dadosPizzaEntradas: tyEntradasGrafico[];
  setDadosPizzaEntradas: (data: tyEntradasGrafico[]) => void;
  dadosBarSubContas: tySubGruposGrafico[];
  setDadosBarSubContas: (data: tySubGruposGrafico[]) => void;
  grupoId: number;
  setGrupoId: (data: number) => void;
}

const DashboardContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode; // Definindo explicitamente o tipo do children
}

export const DashboardProvider: React.FC<AppProviderProps> = ({children}: AppProviderProps) => {

  const [dadosBarDespesas, setDadosBarDespesas] = useState<tyDespesaGrafico[]>([]);
  const [dadosPizzaEntradas, setDadosPizzaEntradas] = useState<tyEntradasGrafico[]>([]);
  const [dadosBarSubContas, setDadosBarSubContas] = useState<tySubGruposGrafico[]>([]);
  const [grupoId, setGrupoId] = useState<number>(0);


  return (
    <DashboardContext.Provider value={{
      dadosBarDespesas, setDadosBarDespesas,
      dadosPizzaEntradas, setDadosPizzaEntradas,
      dadosBarSubContas, setDadosBarSubContas,
      grupoId, setGrupoId
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext deve ser usado dentro de um AppProvider');
  }
  return context;
};