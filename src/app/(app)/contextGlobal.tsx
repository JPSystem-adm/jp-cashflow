// src/app/(app)/contextGlobal.tsx
"use client";

import { retPeriodoAtual } from "@/lib/formatacoes";
import { decodeToken } from "@/lib/decodeToken";
import { ensurePeriodo } from "@/app/(app)/actions/periodoAPI";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type GlobalContextProps = {
  usuarioId: number;
  setUsuarioId: (data: number) => void;

  usuarioLogin: string;
  setUsuarioLogin: (data: string) => void;

  usuarioNome: string;
  setUsuarioNome: (data: string) => void;

  usuarioPerfil: string;
  setUsuarioPerfil: (data: string) => void;

  usuarioEmail: string;
  setUsuarioEmail: (data: string) => void;

  ultimoAcessoISO: string;
  setUltimoAcessoISO: (data: string) => void;

  periodoId: number;
  setPeriodoId: (data: number) => void;

  periodo: string;
  setPeriodo: (data: string) => void;

  emailVerificacao: string;
  setEmailVerificacao: (data: string) => void;

  codigoVerificacao: string;
  setCodigoVerificacao: (data: string) => void;

  isLogged: boolean;
  logout: (redirectTo?: string) => void;
};

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

type GlobalProviderProps = {
  userId?: number;
  children: ReactNode;
};

const LS_EMAIL_KEY = "jp_cashflow_user_email";
const LS_LAST_ACCESS_KEY = "jp_cashflow_last_access_iso";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const row of cookies) {
    const idx = row.indexOf("=");
    if (idx === -1) continue;
    const k = row.slice(0, idx);
    if (k === name) return row.slice(idx + 1);
  }
  return null;
}

function clearTokenCookie() {
  document.cookie = "token=; path=/; max-age=0; samesite=lax";
  document.cookie = "token=; path=/; max-age=0; samesite=lax; secure";
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children, userId }) => {
  const [usuarioId, setUsuarioId] = useState<number>(userId ?? 0);
  const [usuarioLogin, setUsuarioLogin] = useState<string>("");
  const [usuarioNome, setUsuarioNome] = useState<string>("");
  const [usuarioPerfil, setUsuarioPerfil] = useState<string>("");

  const [usuarioEmail, setUsuarioEmail] = useState<string>("");
  const [ultimoAcessoISO, setUltimoAcessoISO] = useState<string>("");

  const [periodoId, setPeriodoId] = useState<number>(0);
  const [periodo, setPeriodo] = useState<string>(retPeriodoAtual());

  const [emailVerificacao, setEmailVerificacao] = useState<string>("");
  const [codigoVerificacao, setCodigoVerificacao] = useState<string>("");

  // evita garantir período duas vezes em dev (StrictMode) e/ou em re-renders
  const ensuredPeriodoRef = useRef<boolean>(false);

  const isLogged = useMemo(
    () => Boolean(usuarioId && usuarioLogin && usuarioNome),
    [usuarioId, usuarioLogin, usuarioNome]
  );

  const logout = (redirectTo: string = "/login") => {
    if (typeof window === "undefined") return;

    clearTokenCookie();
    localStorage.removeItem(LS_EMAIL_KEY);
    localStorage.removeItem(LS_LAST_ACCESS_KEY);

    setUsuarioId(0);
    setUsuarioLogin("");
    setUsuarioNome("");
    setUsuarioPerfil("");
    setUsuarioEmail("");
    setUltimoAcessoISO("");

    // aqui sim pode zerar
    setPeriodoId(0);
    setPeriodo(retPeriodoAtual());

    setEmailVerificacao("");
    setCodigoVerificacao("");

    ensuredPeriodoRef.current = false;

    window.location.href = redirectTo;
  };

  useEffect(() => {
    const run = async () => {
      // 1) reidrata extras do storage
      const storedEmail = localStorage.getItem(LS_EMAIL_KEY);
      if (storedEmail) setUsuarioEmail(storedEmail);

      const storedAccess = localStorage.getItem(LS_LAST_ACCESS_KEY);
      if (storedAccess) setUltimoAcessoISO(storedAccess);

      // 2) reidrata usuário do token
      const token = getCookieValue("token");
      if (!token) return;

      const usuario = decodeToken(token);
      if (!usuario) {
        logout("/login?reason=sem-sessao");
        return;
      }

      setUsuarioId(usuario.id);
      setUsuarioLogin(usuario.login);
      setUsuarioNome(usuario.nome);
      setUsuarioPerfil(usuario.perfil);

      // 3) garante período atual no banco e carrega periodoId
      if (!ensuredPeriodoRef.current) {
        ensuredPeriodoRef.current = true;

        const atualPeriodo = retPeriodoAtual();
        setPeriodo(atualPeriodo);

        try {
          const id = await ensurePeriodo(atualPeriodo);

          // ✅ regra: se logado, o id tem que ser válido
          if (Number.isFinite(id) && id > 0) {
            setPeriodoId(id);
          } else {
            console.error("ensurePeriodo retornou periodoId inválido:", id);
            // ✅ não zera; mantém o que tiver (pode ser 0 apenas na 1ª carga)
          }
        } catch (e) {
          console.error("Erro ao garantir período:", e);
          // ✅ não zera periodoId aqui (contrato)
          // mantém o estado atual
        }
      }
    };

    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        usuarioId,
        setUsuarioId,
        usuarioLogin,
        setUsuarioLogin,
        usuarioNome,
        setUsuarioNome,
        usuarioPerfil,
        setUsuarioPerfil,

        usuarioEmail,
        setUsuarioEmail,
        ultimoAcessoISO,
        setUltimoAcessoISO,

        periodoId,
        setPeriodoId,
        periodo,
        setPeriodo,

        emailVerificacao,
        setEmailVerificacao,
        codigoVerificacao,
        setCodigoVerificacao,

        isLogged,
        logout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export function useGlobalContext(): GlobalContextProps {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext deve ser usado dentro de GlobalProvider");
  }
  return context;
}
