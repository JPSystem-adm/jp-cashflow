"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { DialogTitle } from "@/components/ui/dialog";
import { useOrcamentoContext } from "./contextProvider";
import { RealBRToDouble, DoubleToRealBR } from "@/lib/formatacoes"; 
import { tyResult } from "@/types/types";
import { AtualizaOrcamento } from "@/app/(app)/actions/orcamentoActions";
import queryClient from "@/lib/reactQuery";
import { useGlobalContext } from "@/app/(app)/contextGlobal";

// Definição dos tipos de dados do formulário
type Props = {
  indice: number;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
};

type FormProps = {
  orcamentoId: number;
  valor: string;
}

// Schema de validação com zod
const schema = z.object({
  valor: z.string().regex(/^\R?\$?\s?\d+(.\d{3})*(\,\d{0,2})?$/, 'Valor monetário inválido'),
});

export default function FormOrcamento ({indice, isEdita, setIsEdita}: Props) {

  const {dados } = useOrcamentoContext();
  const {periodoId } = useGlobalContext();


  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      valor: DoubleToRealBR(dados[indice].valor || 0),
    },
  });

  const handleClose = () => {
    setIsEdita(false);
    form.reset();
  };

  const onSubmit = async (values: FormProps) => {
    let retorno:tyResult;
    try {
      retorno = await AtualizaOrcamento(dados[indice].orcamentoId || 0, RealBRToDouble(values.valor))

    } catch (error) {
  
    }

    //Limpar o cache da consulta para atualizar os dados
    queryClient.refetchQueries(["orcamentos", periodoId]);

    handleClose();
  };

  return (
    <div className="flex flex-col">
      <Sheet open={isEdita} onOpenChange={setIsEdita}>
        <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[300px] max-h-[330px] min-w-[400px] max-w-[400px] overflow-x-auto rounded-2xl bg-white p-8 text-sky-800 shadow">
          <DialogTitle className="text-sky-900 mb-412">Editar Orçamento</DialogTitle>
          <Label className="text-sky-600 bold">Alterar o valor do orçamento do grupo {dados[indice].nomeGrupo}</Label>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4 mt-7">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900">Valor</FormLabel>
                      <FormControl>
                        <Input
                          className="placeholder:text-sky-900 w-full text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <SheetFooter className="mt-7 flex justify-between">
                <Button
                  type="submit"
                  variant="outline"
                  className="h-9 w-22 border-2 text-sky-900 border-sky-800"
                >
                  Concluir
                </Button>
                <SheetClose asChild>
                  <Button
                    className="h-9 w-22 border-2 text-red-700 border-red-800"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancelar
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
};

