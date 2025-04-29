// src/app/(app)/contextGlobal.tsx
"use client";

import { retPeriodoAtual } from '@/lib/formatacoes';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { decodeToken } from "@/lib/decodeToken";

interface GlobalContextProps {
  usuarioId: number;
  setUsuarioId: (data: number) => void;
  usuarioLogin: string;
  setUsuarioLogin: (data: string) => void;
  usuarioNome: string;
  setUsuarioNome: (data: string) => void;
  usuarioPerfil: string;
  setUsuarioPerfil: (data: string) => void;
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
  userId?: number;
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children, userId }) => {
  const [usuarioId, setUsuarioId] = useState<number>(userId || 0);
  const [usuarioLogin, setUsuarioLogin] = useState<string>("");
  const [usuarioNome, setUsuarioNome] = useState<string>("");
  const [usuarioPerfil, setUsuarioPerfil] = useState<string>("");

  const [periodoId, setPeriodoId] = useState<number>(0);
  const [periodo, setPeriodo] = useState<string>(retPeriodoAtual());

  const [emailVerificacao, setEmailVerificacao] = useState<string>("");
  const [codigoVerificacao, setCodigoVerificacao] = useState<string>("");

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
  
    if (token) {
      const usuario = decodeToken(token);
      if (usuario) {
        setUsuarioId(usuario.id);
        setUsuarioLogin(usuario.login);
        setUsuarioNome(usuario.nome);
        setUsuarioPerfil(usuario.perfil);
      }
    }
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        usuarioId, setUsuarioId,
        usuarioLogin, setUsuarioLogin,
        usuarioNome, setUsuarioNome,
        usuarioPerfil, setUsuarioPerfil,
        periodoId, setPeriodoId,
        periodo, setPeriodo,
        emailVerificacao, setEmailVerificacao,
        codigoVerificacao, setCodigoVerificacao,
      }}
    >
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
