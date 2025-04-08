"use client"

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card"
import { useState } from "react";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { NovoUsuario } from "@/app/(app)/actions/usarioActions"
import { useRouter } from "next/navigation"
import LabelError from "@/components/ui/jp/labelError"
import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
//import { useContext } from "react"
//import { ModalContext } from "@/components/ui/jp/modal/modal-context"

const schema = z
  .object({
    login: z.string().min(2, "Campo obrigatorio!").toUpperCase(),
    email: z.string().email("Digite um email valido!"),
    nome: z.string().min(1, "Campo obrigatorio!"),
    perfil: z.enum(["admin", "default"], {
      errorMap: () => {
        return { message: "Informe 'admin' ou 'default'." }
      },
    }),
    senha: z.string().min(6, "A senha precisa ter no minimo 6 caracteres!"),
    confirmaSenha: z.string(),
  })
  .refine((fields) => fields.senha === fields.confirmaSenha, {
    path: ["confirmaSenha"],
    message: "As senhas precisam ser iguais!",
  })

type FormProps = z.infer<typeof schema>

export default function NovoUsuarioForm() {
  const router = useRouter()
  //Variaveis para a caixa de avisos (WarningBox)
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Menssagem default");

  //Função para fechar a caixa de aviso
  const handleFechar=()=>{
    setShowAlerta(false);
    if(tipo === tipoEnu.Sucesso){
      router.replace("/")
    }
  };

  //const { setShow, setTitle, setBody } = useContext(ModalContext)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormProps>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  })

  const handleForm = async (data: FormProps) => {
    try {      
      const dados = {
        key: 0,
        id: 0,
        email: data.email,
        nome: data.nome,
        senha: data.senha,
        perfil: data.perfil,
        login: data.login,
        token: undefined,
        dtToken: undefined,
        confirmaSenha: data.confirmaSenha,
      }
  
      const ret = await NovoUsuario(dados)
      if (ret.status > 0) {
        setTipo(tipoEnu.Sucesso);
        setMensagem(ret.menssage);
        setShowAlerta(true);
        //router.replace("/")
      } else {
        setTipo(tipoEnu.Erro);
        setMensagem(ret.menssage);
        setShowAlerta(true);
      }
    } catch (erro: any) {
      let men = "Ocorreu um erro inesperado!";
      men = men + ": " + erro?.message;

      setTipo(tipoEnu.Erro);
      setMensagem(men);
      setShowAlerta(true);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      { showAlerta && (
          <WarningBox
            tipo={tipo}
            mensagem={mensagem}
            onCancel={handleFechar}
          />
        )
      }   
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-sky-800">Cadastro</CardTitle>
          <CardDescription className="text-sky-700">Entre com os dados para o cadastro</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleForm)} className="space-y-4">
            <div className="space-y-2 text-sky-700">
              <Label htmlFor="login">Login</Label>
              <Input id="login" type="text" {...register("login")} />
              {errors.login ? (
                <LabelError>{errors?.login?.message}</LabelError>
              ) : (
                ""
              )}
            </div>
            <div className="space-y-2 text-sky-700">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email ? (
                <LabelError>{errors?.email?.message}</LabelError>
              ) : (
                ""
              )}
            </div>
            <div className="space-y-2 text-sky-700">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" type="text" {...register("nome")} />
              {errors.nome ? (
                <LabelError>{errors?.nome?.message}</LabelError>
              ) : (
                ""
              )}
            </div>
            <div className="space-y-2 text-sky-700">
              <Label htmlFor="perfil">Perfil</Label>
              <Input id="perfil" type="text" {...register("perfil")} />
              {errors.perfil ? (
                <LabelError>{errors?.perfil?.message}</LabelError>
              ) : (
                ""
              )}
            </div>
            <div className="space-y-2 text-sky-700">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" type="password" {...register("senha")} />
              {errors.senha ? (
                <LabelError>{errors?.senha?.message}</LabelError>
              ) : (
                ""
              )}
            </div>
            <div className="space-y-2 text-sky-700">
              <Label htmlFor="confirmaSenha">Confirmação da Senha</Label>
              <Input
                id="confirmaSenha"
                type="password"
                {...register("confirmaSenha")}
              />
              {errors.confirmaSenha ? (
                <LabelError>{errors?.confirmaSenha?.message}</LabelError>
              ) : (
                ""
              )}
            </div>
            <div className="flex space-x-4">
              <Button
                className="flex-1 text-sky-600 hover:text-sky-800 text-xl"
                variant="outline"
                type="submit"
              >
                Cadastrar
              </Button>
              <Button
                className="flex-1 text-sky-600 hover:text-sky-800 text-xl"
                variant="outline"
                type="button"
                onClick={() => router.back()}
              >
                Voltar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
