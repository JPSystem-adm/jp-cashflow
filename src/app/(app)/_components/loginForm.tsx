"use client";

import { CardTitle, CardHeader, CardContent, Card, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { signIn } from "next-auth/react";
//import { useSearchParams } from "next/navigation";
import { useGlobalContext } from "../contextGlobal";
import {useRouter} from 'next/navigation'
import { useEffect } from "react";
import { useState } from "react";

type Props = {
  defaultLogin?: string;
};

export default function LoginForm({ defaultLogin = "" }: Props)  {
  console.log("Carrega login form: ", defaultLogin);
  const [login, setLogin] = useState(defaultLogin);
  const router = useRouter();


  //Recuperar as funções do contexto
  const {setEmailVerificacao, setCodigoVerificacao, setUsuarioId} = useGlobalContext();

  //Inicializar o HOOK useForm
  const form = useForm();

  useEffect(() => {
    if (login) {
      form.setValue("nickname", login);
    }
  }, [login, form]);


  // //Constantes para Estilo tailwind dos controles do formulário
  const clsLabel = "text-xl font-bold text-sky-900";
  const clsInput = "text-xl h-10";
  //const clsErro  = "text-xl h-10 text-red-600 font-bold";

  const handleSubmit = form.handleSubmit((data) => {
    console.log("Envia Credenciais: ", data);
    signIn("credentials", {
      ...data,
      callbackUrl: "/dashboard",
    });
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
        const errorData = await res.json();
        alert(`Erro: ${errorData.erro || "Falha na solicitação"}`);
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
    <div className="flex items-center mt-[10%] justify-center align-middle w-screen" >
      <Card className="w-[80%] max-w-[800px]">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl font-bold text-sky-900">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent className="text-4xl">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="nickname" className={clsLabel}> 
                Login
              </Label>
              <Input
                id="nickname"
                required
                type="text"
                className={clsInput}
                {...form.register("nickname")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password" className={clsLabel}>
                Senha
              </Label>
              <Input
                id="password"
                required
                type="password"
                className={clsInput}
                {...form.register("password")}
              />
            </div>
            <div className="pt-8">
              <Button
                className="w-full text-xl font-bold hover:bg-sky-100 hover:text-sky-900 bg-sky-900 text-sky-50"
                variant={"outline"}
                type="submit"
              >
                Login
              </Button>
              {/* {error === "CredentialsSignin" && (
                <div className={clsErro}>Erro no login!</div>
              )} */}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-1">
            <p className="text-center text-xl hover:opacity-100 text-sky-800 opacity-40">
            esqueceu sua senha digite o login para cadastra uma nova senha! 
            <Link
              className="text-blue-600 underline ml-2 dark:text-blue-400"
              onClick={() => enviaCodigo()}
              href="#"
              //href="/cadastros/usuarios/verificacao"
            >
              Esqueceu a senha?
            </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
