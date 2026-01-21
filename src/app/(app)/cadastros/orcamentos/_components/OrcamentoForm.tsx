// src/app/(app)/cadastros/orcamentos/_components/OrcamentoForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogTitle } from "@/components/ui/dialog";

import { useOrcamentoContext } from "./contextProvider";
import { RealBRToDouble, DoubleToRealBR } from "@/lib/formatacoes";
import { useGlobalContext } from "@/app/(app)/contextGlobal";

import queryClient from "@/lib/reactQuery";
import { atualizarValorOrcamento } from "@/app/(app)/actions/orcamentoAPI";

type Props = {
  indice: number;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
};

type FormProps = {
  valor: string;
};

const schema = z.object({
  valor: z.string().regex(/^\R?\$?\s?\d+(.\d{3})*(\,\d{0,2})?$/, "Valor monetário inválido"),
});

export default function FormOrcamento({ indice, isEdita, setIsEdita }: Props) {
  const { dados } = useOrcamentoContext();
  const { periodoId } = useGlobalContext();

  const nomeGrupo = dados[indice]?.nomeGrupo ?? "";
  const orcamentoId = dados[indice]?.orcamentoId ?? 0;
  const valorAtual = dados[indice]?.valor ?? 0;

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: { valor: DoubleToRealBR(valorAtual) },
  });

  const handleClose = () => {
    setIsEdita(false);
    form.reset({ valor: DoubleToRealBR(valorAtual) });
  };

  const onSubmit = async (values: FormProps) => {
    try {
      const novoValor = RealBRToDouble(values.valor);
      await atualizarValorOrcamento(orcamentoId, novoValor);

      // atualiza tabela
      queryClient.refetchQueries(["orcamentos", periodoId]);

      handleClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar orçamento";
      alert(msg);
    }
  };

  return (
    <div className="flex flex-col">
      <Sheet open={isEdita} onOpenChange={setIsEdita}>
        <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[300px] max-h-[380px] w-[92vw] max-w-[440px] overflow-y-auto rounded-2xl bg-white p-6 text-sky-800 shadow">
          <DialogTitle className="text-sky-900 mb-3">Editar Orçamento</DialogTitle>

          <Label className="text-sky-600 font-semibold">
            Alterar o valor do orçamento do grupo {nomeGrupo}
          </Label>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4 mt-6">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900">Valor</FormLabel>
                      <FormControl>
                        <Input className="placeholder:text-sky-900 w-full text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter className="mt-6 flex justify-between">
                <Button type="submit" variant="outline" className="h-9 border-2 text-sky-900 border-sky-800">
                  Concluir
                </Button>

                <SheetClose asChild>
                  <Button
                    className="h-9 border-2 text-red-700 border-red-800"
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
}
