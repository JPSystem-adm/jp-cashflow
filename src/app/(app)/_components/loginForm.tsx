// src/app/(app)/_components/loginForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { CardTitle, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useGlobalContext } from "../contextGlobal";

type Props = {
  defaultLogin?: string;
};

type FormValues = {
  nickname: string;
  password: string;
};

type LoginResponse = {
  usuario?: {
    id: number;
    login: string;
    nome: string;
    perfil: string;
    email?: string;
  };
  token: string;
};

type ErrorResponse = {
  erro?: string;
  error?: string;
};

function getApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env.local/.env");
  return v.replace(/\/$/, "");
}

function setAuthCookie(token: string) {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const base = `token=${encodeURIComponent(token)}; path=/; max-age=86400; samesite=lax`;
  document.cookie = isHttps ? `${base}; secure` : base;
}

export default function LoginForm({ defaultLogin = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reason = searchParams.get("reason"); // ex: "sem-sessao"
  const userFromUrl = (searchParams.get("user") ?? "").trim();

  const [login, setLogin] = useState(defaultLogin);

  const form = useForm<FormValues>({
    defaultValues: {
      nickname: defaultLogin,
      password: "",
    },
  });

  const {
    setEmailVerificacao,
    setCodigoVerificacao,
    setUsuarioId,
    setUsuarioLogin,
    setUsuarioNome,
    setUsuarioPerfil,
    setUsuarioEmail,
    setUltimoAcessoISO,
  } = useGlobalContext();

  useEffect(() => {
    if (defaultLogin) {
      form.setValue("nickname", defaultLogin, { shouldValidate: false, shouldDirty: false });
      setLogin(defaultLogin);
    }
  }, [defaultLogin, form]);

  const sessionMessage = useMemo(() => {
    if (reason === "sem-sessao") {
      return "Sua sessão não é mais válida. Faça login novamente.";
    }
    return null;
  }, [reason]);

  const handleSubmit = form.handleSubmit(async (data) => {
    const baseURL_API = getApiBaseUrl();

    const nickname = (data.nickname ?? "").trim();
    const password = (data.password ?? "").trim();

    if (!nickname || !password) {
      alert("Informe login e senha.");
      return;
    }

    try {
      const res = await fetch(`${baseURL_API}/api/public/global/autenticacao/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: nickname.toUpperCase(),
          senha: password,
        }),
      });

      if (!res.ok) {
        const errJson = (await res.json().catch(() => ({}))) as ErrorResponse;
        alert(errJson.erro || errJson.error || "Falha na autenticação!");
        return;
      }

      const dados = (await res.json()) as LoginResponse;

      if (dados.usuario?.id) {
        setUsuarioId(dados.usuario.id);
        setUsuarioLogin(dados.usuario.login);
        setUsuarioNome(dados.usuario.nome);
        setUsuarioPerfil(dados.usuario.perfil);

        const email = typeof dados.usuario.email === "string" ? dados.usuario.email : "";
        setUsuarioEmail(email);

        const nowISO = new Date().toISOString();
        setUltimoAcessoISO(nowISO);

        // ✅ persistência pro menu sobreviver ao refresh
        localStorage.setItem("jp_cashflow_user_email", email);
        localStorage.setItem("jp_cashflow_last_access_iso", nowISO);
      }

      setAuthCookie(dados.token);

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("🚨 Erro na autenticação:", error);
      alert("Erro ao autenticar. Tente novamente.");
    }
  });

  async function enviaCodigo() {
    const identificador = (form.getValues("nickname") ?? "").trim();
    if (!identificador) {
      alert("Por favor informar um login válido ou o email cadastrado!");
      return;
    }

    try {
      const apiUrl = getApiBaseUrl();

      const res = await fetch(`${apiUrl}/api/public/global/auth/redefinirSenha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginOuEmail: identificador }),
      });

      if (!res.ok) {
        const erro = (await res.json().catch(() => ({}))) as ErrorResponse;
        alert(erro.erro || erro.error || "Falha na solicitação.");
        return;
      }

      const data = (await res.json()) as {
        dados: { email: string; codigo: string; id: number };
      };

      setEmailVerificacao(data.dados.email);
      setCodigoVerificacao(data.dados.codigo);
      setUsuarioId(data.dados.id);

      router.push("/cadastros/usuarios/verificacao");
    } catch (error: unknown) {
      console.error("🚨 Erro ao enviar email:", error);
      alert("Erro ao enviar email. Tente novamente.");
    }
  }

  function irParaCadastro() {
    const u = (userFromUrl || login || "").trim();
    const qs = u ? `?user=${encodeURIComponent(u)}` : "";
    router.push(`/cadastros/usuarios/cadastro${qs}`);
  }

  return (
    <div className="w-full px-4">
      <Card className="w-full max-w-md mx-auto mt-10 sm:mt-16">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-sky-900">
            Login
          </CardTitle>
          <p className="text-sm sm:text-base text-slate-600">
            Acesse sua conta para continuar
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {sessionMessage ? (
            <Alert>
              <AlertTitle className="text-sky-900">Atenção</AlertTitle>
              <AlertDescription className="text-sky-900">
                {sessionMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nickname" className="text-base sm:text-lg font-bold text-sky-900">
                Login ou Email
              </Label>
              <Input
                id="nickname"
                className="h-11 sm:h-12 text-base sm:text-lg"
                {...form.register("nickname", { required: true })}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-base sm:text-lg font-bold text-sky-900">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                className="h-11 sm:h-12 text-base sm:text-lg"
                {...form.register("password", { required: true })}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <Button type="submit" className="w-full sm:w-auto text-base sm:text-lg">
                Entrar
              </Button>

              <Button
                type="button"
                variant="link"
                onClick={enviaCodigo}
                className="w-full sm:w-auto justify-center text-sky-700"
              >
                Esqueci a senha
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full text-base sm:text-lg border-sky-800 border-2 hover:bg-slate-100 text-sky-900"
              onClick={irParaCadastro}
            >
              Criar cadastro
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-xs sm:text-sm text-muted-foreground text-center w-full">
            &copy; {new Date().getFullYear()} JPSystem
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
