"use client";

import { retPeriodoAtual } from '@/lib/formatacoes';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';


interface GlobalContextProps {
  usuarioId: number;
  setUsuarioId: (data: number) => void;
  periodoId: number;
  setPeriodoId: (data: number) => void;
  periodo: string;
  setPeriodo: (data: string) => void;
  emailVerificacao: string;
  setEmailVerificacao: (data: string) => void;
  codigoVerificacao: string;
  setCodigoVerificacao: (data: string) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

interface GlobalProviderProps {
  userId: number|undefined;
  children: ReactNode; // Definindo explicitamente o tipo do children
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({children, userId}: GlobalProviderProps) => {

  //const { data: session } = useSession();

  const [usuarioId, setUsuarioId] = useState<number>(userId||0);
  const [periodoId, setPeriodoId] = useState<number>(0);
  const [periodo, setPeriodo ] = useState<string>(retPeriodoAtual());
  const [emailVerificacao, setEmailVerificacao ] = useState<string>("");
  const [codigoVerificacao, setCodigoVerificacao ] = useState<string>("");



  return (
    <GlobalContext.Provider value={{  usuarioId, setUsuarioId, 
                                      periodoId, setPeriodoId, 
                                      periodo, setPeriodo, 
                                      emailVerificacao, setEmailVerificacao, 
                                      codigoVerificacao, setCodigoVerificacao }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext deve ser usado dentro de um AppProvider');
  }
  return context;
};