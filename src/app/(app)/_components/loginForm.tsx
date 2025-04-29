// src/app/(app)/_components/loginForm.tsx
"use client";

import { CardTitle, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useGlobalContext } from "../contextGlobal";
import {useRouter} from 'next/navigation'
import { useEffect, useState } from "react";


type Props = {
  defaultLogin?: string;
};

export default function LoginForm({ defaultLogin = "" }: Props)  {
  const router = useRouter();
  const form = useForm();
  const [login, setLogin] = useState(defaultLogin);

  //Recuperar as funções do contexto
  const { setEmailVerificacao, 
          setCodigoVerificacao, 
          setUsuarioId, 
          setUsuarioLogin, 
          setUsuarioNome, 
          setUsuarioPerfil
        } = useGlobalContext();

  useEffect(() => {
    if (defaultLogin) {
      form.setValue("nickname", defaultLogin);
      setLogin(defaultLogin);
    }
  }, [defaultLogin]);


  // //Constantes para Estilo tailwind dos controles do formulário
  const clsLabel = "text-xl font-bold text-sky-900";
  const clsInput = "text-xl h-10";


  const handleSubmit = form.handleSubmit(async (data) => {
    const baseURL_API = process.env.NEXT_PUBLIC_BASEURL_API || "http://localhost:3001";

    try {
      const res = await fetch(`${baseURL_API}/api/public/global/autenticacao/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: data.nickname.toUpperCase(), // Garantir caixa alta
          senha: data.password,
        }),
      });
  
      if (!res.ok) {
        const error = await res.json();
        alert(error.erro || "Falha na autenticação!");
        return;
      }
  
      const dados = await res.json();
  
       // Aqui só lidamos com os dados que vierem no corpo, sem mexer no token
       if (dados.usuario?.id) {
        setUsuarioId(dados.usuario.id);
        setUsuarioLogin(dados.usuario.login);
        setUsuarioNome(dados.usuario.nome);
        setUsuarioPerfil(dados.usuario.perfil);
      }

      // 🔐 Salvar token no cookie
      document.cookie = `token=${dados.token}; path=/; max-age=86400`;
      
      router.push("/dashboard");
  
    } catch (error) {
      console.error("🚨 Erro na autenticação:", error);
      alert("Erro ao autenticar. Tente novamente.");
    }

  });

  async function enviaCodigo(){
    const identificador = form.getValues("nickname");

    //verificar se foi digitado um logim ou email
    if(!identificador){
      alert("Por favor informar um login valido ou o email cadastrado!")
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BASEURL_API || "http://localhost:3001"; // Ajuste a URL
      
      const res = await fetch(`${apiUrl}/api/public/global/auth/redefinirSenha`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loginOuEmail: identificador }),
      });

      if (!res.ok) {
        const erro = await res.json();
        alert(erro.erro || "Falha na solicitação.");
        return;
      }
    
    const data = await res.json();
    
    // Atualiza o estado global com os dados retornados
    setEmailVerificacao(data.dados.email);
    setCodigoVerificacao(data.dados.codigo);
    setUsuarioId(data.dados.id);

    router.push('/cadastros/usuarios/verificacao');

  } catch (error) {
    console.error("🚨 Erro ao enviar email:", error);
    alert("Erro ao enviar email. Tente novamente.");
  }

}

  return (
    //<div className="flex items-center mt-[10%] justify-center w-screen">
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-bold text-sky-900">Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nickname" className={clsLabel}>Login ou Email</Label>
            <Input id="nickname" {...form.register("nickname")} className={clsInput} />
          </div>
          <div>
            <Label htmlFor="password" className={clsLabel}>Senha</Label>
            <Input id="password" type="password" {...form.register("password")} className={clsInput} />
          </div>
          <div className="flex justify-between">
            <Button type="submit" className="text-xl">Entrar</Button>
            <Button type="button" variant="link" onClick={enviaCodigo} className="text-sky-700">Esqueci a senha</Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground text-center w-full">
          &copy; {new Date().getFullYear()} JPSystem
        </p>
      </CardFooter>
    </Card>
    //</div>
  );
}
