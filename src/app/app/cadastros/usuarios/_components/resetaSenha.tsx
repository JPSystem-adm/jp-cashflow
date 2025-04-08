"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import LabelError from "@/components/ui/jp/labelError"
import { useGlobalContext } from "@/app/app/contextGlobal"
import { AlteraSenha } from "@/app/app/actions/usarioActions"

const FormSchema = z.object({
  senha: z.string().min(6, "A senha precisa ter no minimo 6 caracteres!"),
  confirmaSenha: z.string(),
  })
  .refine((fields) => fields.senha === fields.confirmaSenha, {
    path: ["confirmaSenha"],
    message: "As senhas precisam ser iguais!",
  })

  type FormProps = z.infer<typeof FormSchema>
export function ResetaSenha() {

  const router = useRouter();

  //Recuperar as funções do contexto
  const { usuarioId } = useGlobalContext(); 

  //Constantes para Estilo tailwind dos controles do formulário
  const clsLabel = "text-xl font-bold text-sky-900";
  const clsInput = "text-xl h-10";
  const clsErro  = "text-xl h-10 text-red-600 font-bold";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormProps>({
    mode: "all",
    reValidateMode: "onChange",
    resolver: zodResolver(FormSchema),
  })


  const handleForm = async (data: FormProps) => {
    const dados = {
      id: usuarioId,
      senha: data.senha,
      confirmaSenha: data.confirmaSenha,
    }

    const ret = await AlteraSenha(dados)

    if (ret.status === "Sucesso") {
      router.replace("/app/")
    } else {
      return;
    }
  }
  return (
    <div
      className="flex flex-col items-center mt-[10%] justify-center align-middle w-screen"
    >
      <Card className="w-[80%] max-w-[800px]">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl text-left font-bold text-sky-900 border-b-8 border-solid mb-8">
            Alterar Senha...
          </CardTitle>
        </CardHeader>
      <CardContent className="text-4xl">
        <form onSubmit={handleSubmit(handleForm)} className="space-y-4">
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
              onClick={() => router.replace("/app/")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
      </Card>
    </div>
  )
}
