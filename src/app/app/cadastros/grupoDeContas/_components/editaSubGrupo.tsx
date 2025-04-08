"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import { tySubGrupo } from "@/types/types"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface Props {
  onEditItem: (nome: string, novosDados: { descricao?: string; ativo?: boolean }) => Promise<boolean>;
  data: tySubGrupo;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
}

const schema = z.object({
  nome: z.string().min(3, "O nome da subconta deve ter pelo menos 3 caracteres."),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  ativo: z.boolean()
})

type FormProps = z.infer<typeof schema>

export default function EditaSubGrupo({onEditItem, data, isEdita, setIsEdita}: Props) {
  //O variavel isEdita substitui isOpen e é tratada no formulario pai e serve
  //para controle do formulario de edição doso dados (EditaSubGrupo)

  //Função para fechar a SHEET
  const handleClose = () => {
    setIsEdita(false)
  }

  //Definição do formulario
  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: data?.nome,
      descricao: data?.descricao,
      ativo: data?.ativo,
    },
  })

  //Definição do submit handler.
  async function onSubmit(values: FormProps) {
    const newItem: tySubGrupo = {
      //id: data.length + 1,
      nome: values.nome.toUpperCase(),
      descricao: values.descricao,
      ativo: values.ativo
    }
    const retorno = await onEditItem(values.nome, {descricao: values.descricao, ativo: values.ativo})
    if (retorno) {
      setIsEdita(false)
    } else {
      alert("Não foi possivel atualizar!")
      setIsEdita(true)
    }
  }

  return (
    <Sheet open={isEdita}>
      <SheetContent
        side="top"
        className={`bg-gray-100/90 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-fit  h-fit overflow-auto rounded-2xl bg-white p-8 text-gray-900 shadow justify-self-center`}>
        <SheetHeader>
          <SheetTitle>Editar SubGrupo</SheetTitle>
        </SheetHeader>
        {/* //Inclusão do formulário */}
        {isEdita && (
          <div className="flex flex-col w-full items-end space-y-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome" disabled={true} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descricao" {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        Digite a descrição do subgrupo.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem
                      //onChange={handleChange} 
                      className="flex items-center justify-start "
                    >
                      <FormLabel className={"mr-2"}>Ativo</FormLabel>
                      <FormControl>
                        <Checkbox 
                          className={"h-6 w-6"} 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          //defaultChecked 
                        />
                      </FormControl>
                      {/* <FormDescription>
                        Defina se o subgrupo está ativo.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-right mt-8 space-x-4">
                  <SheetFooter>
                    <Button variant="outline" type="submit">
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                      Cancelar
                    </Button>
                  </SheetFooter>
                </div>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
