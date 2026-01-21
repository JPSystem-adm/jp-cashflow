// src/app/(app)/cadastros/grupoDeContas/_components/editaSubGrupo.tsx

"use client";

import React, { useEffect } from "react";
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

import type { tySubGrupo } from "@/types/types";

interface Props {
  onEditItem: (
    nome: string,
    novosDados: { descricao?: string; ativo?: boolean }
  ) => Promise<boolean>;
  data: tySubGrupo;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
}

const schema = z.object({
  nome: z.string().min(3, "O nome da subconta deve ter pelo menos 3 caracteres."),
  descricao: z
    .string()
    .min(2, "Campo obrigatório!")
    .transform((v) => v.trim()),
  ativo: z.boolean().default(true),
});

type FormProps = z.infer<typeof schema>;

export default function EditaSubGrupo({ onEditItem, data, isEdita, setIsEdita }: Props) {
  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: data?.nome ?? "",
      descricao: data?.descricao ?? "",
      ativo: data?.ativo ?? true,
    },
  });

  // ✅ garante que ao trocar o "data" o form atualiza corretamente
  useEffect(() => {
    form.reset({
      nome: data?.nome ?? "",
      descricao: data?.descricao ?? "",
      ativo: data?.ativo ?? true,
    });
  }, [data, form]);

  function handleClose(): void {
    setIsEdita(false);
  }

  async function onSubmit(values: FormProps): Promise<void> {
    const ok = await onEditItem(values.nome, {
      descricao: values.descricao,
      ativo: values.ativo,
    });

    if (ok) {
      setIsEdita(false);
      return;
    }

    // mantém aberto se falhar
    setIsEdita(true);
  }

  return (
    <Sheet open={isEdita} onOpenChange={setIsEdita}>
      <SheetContent
        aria-describedby="descricao-edita-subgrupo"
        className={[
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-[95vw] sm:w-full sm:max-w-xl lg:max-w-2xl",
          "h-[90vh] max-h-[90vh]",
          "overflow-auto rounded-2xl bg-white p-4 sm:p-6 shadow-lg",
        ].join(" ")}
      >
        <SheetHeader>
          <SheetTitle className="text-xl sm:text-2xl text-sky-900">
            Editar SubGrupo
          </SheetTitle>
          <p id="descricao-edita-subgrupo" className="text-muted-foreground text-sm">
            Altere a descrição e o status do subgrupo
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
                            className="placeholder:text-sky-800 border-2 border-sky-900"
                            disabled
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
                        className="placeholder:text-sky-800 border-2 border-sky-900 min-h-[140px]"
                        placeholder="Atualize a descrição..."
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
                  Salvar
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
