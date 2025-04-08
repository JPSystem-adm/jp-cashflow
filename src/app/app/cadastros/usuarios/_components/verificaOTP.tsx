"use client"

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot} from "@/components/ui/input-otp"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGlobalContext } from "@/app/app/contextGlobal"
import { WarningBox, tipoEnu } from "@/app/app/_components/warningBox";

//Scema do regras para o formulário
const FormSchema = z.object({
  pin: z.string().min(4, {
    message: "O código de verificação deve ter 4 caracteres.",
  }),
})

//Definição de Props
type Props = {
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

export function VerificaOTP({ setStep }: Props) {

  //Variaveis para a caixa de avisos (WarningBox)
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Menssagem default");

  //Função para fechar a caixa de aviso
  const handleFechar=()=>{
    setShowAlerta(false);
  };


  //Constantes para Estilo tailwind dos controles do formulário
  const clsLabel = "text-xl font-bold text-sky-900";

  //Recuperar as funções do contexto
  const { codigoVerificacao } = useGlobalContext();  

  //Inicializar o HOOK useForm
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("Codigo de Verificação: ",codigoVerificacao)
    if(data.pin === codigoVerificacao) {
      setStep(2);
    }else{
      setTipo(tipoEnu.Erro);
      setMensagem("Codigo verificação errado: " + JSON.stringify(data.pin, null, 2) );
      setShowAlerta(true);      
    }
  }

  return (
    <div
      className="flex flex-col items-center mt-[10%] justify-center align-middle w-screen"
    >
      { showAlerta && (
          <WarningBox
            tipo={tipo}
            mensagem={mensagem}
            onCancel={handleFechar}
          />
        )
      } 
      <Card className="w-[80%] max-w-[800px]">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-4xl text-left font-bold text-sky-900 border-b-8 border-solid mb-8">
            Alterar Senha...
          </CardTitle>
        </CardHeader>
      <CardContent className="text-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className={`${clsLabel} mb-8`}>Código de confirmação</FormLabel>
                  <FormControl className="mb-8 mt-4" >
                    <InputOTP maxLength={4} {...field} >
                      <InputOTPGroup >
                        <InputOTPSlot index={0} className="w-16 h-16 text-4xl text-red-950 font-bold " />
                        <InputOTPSlot index={1} className="w-16 h-16 text-4xl text-red-950 font-bold "/>
                        <InputOTPSlot index={2} className="w-16 h-16 text-4xl text-red-950 font-bold "/>
                        <InputOTPSlot index={3} className="w-16 h-16 text-4xl text-red-950 font-bold "/>
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className={`${clsLabel} mb-16`}>
                    Por favor entre com o código de confirmação enviado para seu email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-8 pt-10">
              <Button type="submit" variant="outline" className="text-green-600 border-green-800 hover:text-green-800">Verificar</Button>
              <Button variant="outline" className="text-blue-600 border-blue-800 hover:text-blue-800">Reenviar</Button>
              <Button variant="outline" className="text-red-600 border-red-800 hover:text-red-800" >Cancelar</Button>
            </div>
          </form>
        </Form>
      </CardContent>
      </Card>
    </div>
  )
}
