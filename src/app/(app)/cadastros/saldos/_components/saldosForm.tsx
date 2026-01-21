// src/app/(app)/cadastros/saldos/_components/saldosForm.tsx

"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogTitle } from "@/components/ui/dialog";

import { RealBRToDouble, DoubleToRealBR } from "@/lib/formatacoes";
import { useSaldoContext } from "./contextSaldosProvider";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { useQueryClient } from "react-query";

import { atualizarValorSaldo } from "@/app/(app)/actions/saldoAPI";

type Props = {
  indice: number;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
};

const schema = z.object({
  valor: z
    .string()
    .min(1, "Informe um valor.")
    .regex(/^\-?\R?\$?\s?\d+(.\d{3})*(\,\d{0,2})?$/, "Valor monetário inválido"),
});

type FormValues = z.infer<typeof schema>;

export default function FormSaldo({ indice, isEdita, setIsEdita }: Props) {
  const { rows } = useSaldoContext(); // ✅ SaldoRow[]
  const { periodoId } = useGlobalContext();
  const qc = useQueryClient();

  const item = useMemo(() => rows[indice], [rows, indice]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      valor: DoubleToRealBR(item?.saldoInicial ?? 0),
    },
    values: {
      // mantém o input sincronizado quando muda o item
      valor: DoubleToRealBR(item?.saldoInicial ?? 0),
    },
  });

  const handleClose = () => {
    setIsEdita(false);
    form.reset({
      valor: DoubleToRealBR(item?.saldoInicial ?? 0),
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (!item) return;

    // ✅ garante id válido
    const saldoId = Number(item.saldoId);
    if (!Number.isFinite(saldoId) || saldoId <= 0) return;

    try {
      const valorNum = RealBRToDouble(values.valor);
      await atualizarValorSaldo(saldoId, valorNum);

      await qc.invalidateQueries(["saldos", periodoId]);
      handleClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar saldo";
      alert(msg);
    }
  };

  return (
    <div className="flex flex-col">
      <Sheet open={isEdita} onOpenChange={setIsEdita}>
        <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[420px] min-h-[280px] max-h-[360px] overflow-x-auto rounded-2xl bg-white p-6 sm:p-8 text-sky-800 shadow">
          <DialogTitle className="text-sky-900 mb-3">Editar Saldo</DialogTitle>

          <Label className="text-sky-600 font-semibold">
            Alterar o valor do saldo da fonte {item?.fonte ?? ""}
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

              <SheetFooter className="mt-6 flex justify-between gap-2">
                <Button type="submit" className="h-9 border-2 text-sky-900 border-sky-800">
                  Concluir
                </Button>

                <SheetClose asChild>
                  <Button
                    type="button"
                    className="h-9 border-2 text-sky-900 border-sky-800"
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
