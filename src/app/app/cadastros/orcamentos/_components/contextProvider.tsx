"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tyOrcamento } from '@/types/types';

interface AppContextProps {
  dados: tyOrcamento[];
  setDados: (data: tyOrcamento[]) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  userId: number|undefined;
  children: ReactNode; // Definindo explicitamente o tipo do children
}

export const AppProvider: React.FC<AppProviderProps> = ({children, userId}: AppProviderProps) => {

  const [dados, setDados] = useState<tyOrcamento[]>([]);

  return (
    <AppContext.Provider value={{ dados, setDados }}>
      {children}
    </AppContext.Provider>
  );
};

export const useOrcamentoContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
