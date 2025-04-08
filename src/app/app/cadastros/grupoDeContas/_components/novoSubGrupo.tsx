"use client";

// COMPONENTE FILHO
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { tyResult, tySubGrupo } from "@/types/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { WarningBox,tipoEnu } from "@/app/_components/warningBox";

interface Props {
  onAddItem: (item: tySubGrupo) => Promise<tyResult>;
}

const schema = z.object({
  nome: z.string().min(3, "O nome da subconta deve ter pelo menos 3 caracteres."),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres."),
  ativo: z.boolean(),
});

type FormProps = z.infer<typeof schema>;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export default function NovoSubGrupo({ onAddItem }: Props) {
  // Variável de estado isOpen
  const [isOpen, setIsOpen] = useState(false);

    //Variaveis para a caixa de avisos (WarningBox)
    const [showAlerta, setShowAlerta] = useState(false);
    const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
    const [mensagem, setMensagem] = useState("Menssagem default");
  
    //Função para fechar o formulário de edição dos dados
    const handleFechar=()=>{
      //setSubGruposP([]);
      //setIsEdita(false);
      setShowAlerta(false);
    };

  // Função para fechar a SHEET
  const handleClose = () => {
    setIsOpen(false);
  };

  // Definição do formulário
  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      descricao: "",
      ativo: true,
    },
  });

  // Função para abrir a Sheet
  const handleOpen = () => {
    form.reset();
    setIsOpen(true);
  };

  // Definição do submit handler.
  async function onSubmit(values: FormProps) {
    const newItem: tySubGrupo = {
      nome: values.nome.toUpperCase(),
      descricao: values.descricao,
      ativo: values.ativo,
    };
    const retorno = await onAddItem(newItem);

    if (retorno.status === "Sucesso") {
      setTipo(tipoEnu.Sucesso);
      setMensagem(retorno.menssagem || "Incluido com sucesso!");
      setShowAlerta(true);
      setIsOpen(false);
    } else {
      setTipo(tipoEnu.Erro);
      setMensagem(retorno.menssagem || "Esse subtipo já existe!");
      setShowAlerta(true);
      //setIsOpen(false);
    }
  }

  return (
    <>
    { showAlerta && (
        <WarningBox
          tipo={tipo}
          mensagem={mensagem}
          onCancel={handleFechar}
        />
      )
    }  
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        className="hover:bg-sky-100 text-sky-900 border-2"
        onClick={handleOpen}
      >
        + SubGrupo
      </Button>
      <SheetContent
        side="top"
        className={`
          bg-gray-100/90 
          left-1/2 top-1/2 
          -translate-x-1/2 
          -translate-y-1/2 
          h-fit
          max-w-[400px] 
          max-h-[600px] 
          overflow-auto 
          rounded-2xl 
          bg-white p-8 
          shadow-lg 
          flex flex-col
          `}
      >
        <SheetHeader>
          <SheetTitle className="text-2xl text-left text-sky-900">Novo SubGrupo</SheetTitle>
          <SheetClose asChild>
            <button
              onClick={handleClose}
              className="absolute right-5 top-1"
            ></button>
          </SheetClose>
        </SheetHeader>
        {/* Inclusão do formulário */}
        <div className="flex flex-col w-full items-center space-y-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 w-full max-w-[400px]"
            >
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-sky-900">
                      Nome
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome"
                        className="placeholder:text-sky-800 border-2 border-sky-900"
                        {...field}
                      />
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
                    <FormLabel className="text-lg font-semibold text-sky-900">
                      Descrição
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição"
                        className="placeholder:text-sky-800 border-2 border-sky-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center">
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center space-y-2 text-sky-900">
                      <FormLabel>Ativo</FormLabel>
                      <FormControl>
                        {/* {...field} checked={field.value}  */}
                        <Checkbox className="border-2 border-sky-900"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="text-sm font-semibold flex justify-end mt-7 text-sky-900">
                <SheetFooter>
                  <Button
                    variant="outline"
                    type="submit"
                    className="text-lg px-2 py-1 hover:bg-slate-200 border-sky-800 border-2"
                  >
                    Incluir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="text-lg px-2 py-1 hover:bg-slate-200 border-sky-800 border-2"
                  >
                    Cancelar
                  </Button>
                </SheetFooter>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
