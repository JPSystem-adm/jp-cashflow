// src/app/(app)/cadastros/grupoDeContas/_components/novoSubGrupo.tsx

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
import type { tyResult, tySubGrupo } from "@/types/types";

interface Props {
  onAddItem: (item: tySubGrupo) => Promise<tyResult>;
}

const schema = z.object({
  nome: z
    .string()
    .min(3, "O nome da subconta deve ter pelo menos 3 caracteres.")
    .transform((v) => v.trim()),
  descricao: z
    .string()
    .min(2, "Campo obrigatório!")
    .transform((v) => v.trim()),
  ativo: z.boolean().default(true),
});

type FormProps = z.infer<typeof schema>;

export default function NovoSubGrupo({ onAddItem }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [showAlerta, setShowAlerta] = useState<boolean>(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState<string>("");

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      descricao: "",
      ativo: true,
    },
  });

  function fecharAviso(): void {
    setShowAlerta(false);
  }

  function handleOpen(): void {
    form.reset({ nome: "", descricao: "", ativo: true });
    setIsOpen(true);
  }

  function handleClose(): void {
    setIsOpen(false);
  }

  async function onSubmit(values: FormProps): Promise<void> {
    const newItem: tySubGrupo = {
      nome: values.nome.toUpperCase(),
      descricao: values.descricao,
      ativo: values.ativo,
    };

    const retorno = await onAddItem(newItem);

    if (retorno.status === "Sucesso") {
      setTipo(tipoEnu.Sucesso);
      setMensagem(retorno.menssagem ?? "Incluído com sucesso!");
      setShowAlerta(true);
      setIsOpen(false);
      return;
    }

    setTipo(tipoEnu.Erro);
    setMensagem(retorno.menssagem ?? "Não foi possível incluir o subgrupo.");
    setShowAlerta(true);
  }

  return (
    <>
      {showAlerta && (
        <WarningBox tipo={tipo} mensagem={mensagem} onCancel={fecharAviso} />
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Button
          variant="outline"
          className="hover:bg-slate-100 text-sky-900 border-2 border-sky-800 hover:text-sky-900 text-base sm:text-xl"
          onClick={handleOpen}
        >
          + SubGrupo
        </Button>

        <SheetContent
          aria-describedby="descricao-subgrupo"
          className={[
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-[95vw] sm:w-full sm:max-w-xl lg:max-w-2xl",
            "h-[90vh] max-h-[90vh]",
            "overflow-auto rounded-2xl bg-white p-4 sm:p-6 shadow-lg",
          ].join(" ")}
        >
          <SheetHeader>
            <SheetTitle className="text-xl sm:text-2xl text-sky-900">
              Novo SubGrupo
            </SheetTitle>
            <p id="descricao-subgrupo" className="text-muted-foreground text-sm">
              Informe os dados do subgrupo
            </p>
          </SheetHeader>

          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-7">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-900">Nome</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: ALUGUEL"
                              className="placeholder:text-sky-800 border-2 border-sky-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row sm:flex-col items-center sm:items-start gap-2 sm:gap-1 sm:mt-6">
                          <FormLabel className="text-sky-900">Ativo</FormLabel>
                          <FormControl>
                            <Checkbox
                              className="border-2 border-sky-900"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900">Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a finalidade desse subgrupo..."
                          className="placeholder:text-sky-800 border-2 border-sky-900 min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SheetFooter className="text-sm mb-2 font-semibold flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end mt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-base sm:text-lg px-3 py-2 hover:bg-slate-200 border-sky-800 border-2"
                    onClick={handleClose}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    variant="outline"
                    className="text-base sm:text-lg px-3 py-2 hover:bg-slate-200 border-sky-800 border-2"
                  >
                    Incluir
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
