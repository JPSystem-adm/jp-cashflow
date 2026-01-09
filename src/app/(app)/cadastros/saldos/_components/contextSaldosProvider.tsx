"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import {  tySomatoriasPeriodo } from '@/types/types';
import { useGlobalContext } from '@/app/(app)/contextGlobal';

// interface AppContextProps {
//   dados: tySaldo[];
//   setDados: (data: tySaldo[]) => void;
// }
interface AppContextProps {
  dados: tySomatoriasPeriodo[];
  setDados: (data: tySomatoriasPeriodo[]) => void;
  userId: number;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode; // Definindo explicitamente o tipo do children
}

export const SaldosProvider: React.FC<AppProviderProps> = ({children}: AppProviderProps) => {

  // const [dados, setDados] = useState<tySaldo[]>([]);
  const [dados, setDados] = useState<tySomatoriasPeriodo[]>([]);
  const { usuarioId } = useGlobalContext();
  
  return (
    <AppContext.Provider value={{ dados, setDados, userId: usuarioId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useSaldoContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};