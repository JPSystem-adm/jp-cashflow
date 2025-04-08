//Este arquivo é para extender a interface do
//usuário padrão do Next Auth

import nextAuth, {DefaultSession} from "next-auth";

declare module "next-auth" {
  interface Session{
    user:{
      role?:      string;
      nickname?:  string;
      name?:      string;
      email?:     string;
      id?:        number;
      token?:     string; // ✅ Agora o token faz parte do tipo User
    }
  }  
  interface User{
    role:     string | undefined;
    nickname: string | undefined;
    id: string;    // ✅ Agora o id faz parte do tipo User
    name: string;  // ✅ Agora o name faz parte do tipo User
    email: string; // ✅ Agora o email faz parte do tipo User
    token: string; // ✅ Agora o token faz parte do tipo User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role:     string | undefined;
    nickname: string | undefined;
    name:     string | undefined;
    email:    string | undefined;
    id:       number | undefined;
  }
}

//Esses Templats e para gerar compatibilidade com a api-cashflow
export type DecodedToken = {
  id: string;
  login: string;
  perfil: "admin" | "default" | "plus" | "premium";
  iat?: number;
  exp?: number;
};

export interface UpdateUserData {
  nome?: string;
  email?: string;
  senha?: string;
}