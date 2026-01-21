// src/app/(app)/cadastros/fonte/_components/novoFonteForm.tsx

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaChevronDown } from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
import { tipoFonte, type tyFonte } from "@/types/types";

import queryClient from "@/lib/reactQuery";
import { criarFonte } from "@/app/(app)/actions/fonteAPI";

const schema = z.object({
  nome: z.string().min(2, "Campo obrigatório. Mínimo (2) caracteres"),
  descricao: z.string().min(2, "Campo obrigatório. Mínimo (2) caracteres"),
  ativo: z.boolean(),
  tipo: z.nativeEnum(tipoFonte, {
    errorMap: () => ({
      message: "Informe o tipo da fonte (Aplicação, Crédito ou Movimentação).",
    }),
  }),
});

type FormProps = z.infer<typeof schema>;

type JsonObject = Record<string, unknown>;

function getApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;
    const msg = obj.erro ?? obj.message ?? obj.error;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

export default function NovoFonteForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Mensagem");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      descricao: "",
      tipo: tipoFonte.Movimentacao,
      ativo: true,
    },
  });

  const handleOpen = () => {
    form.reset({
      nome: "",
      descricao: "",
      tipo: tipoFonte.Movimentacao,
      ativo: true,
    });
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleFecharWarning = () => setShowAlerta(false);

  async function onSubmit(values: FormProps) {
    setIsSubmitting(true);

    try {
      const payload: tyFonte = {
        nome: values.nome,
        descricao: values.descricao,
        tipo: values.tipo,
        ativo: values.ativo,
      };

      const res = await criarFonte({
        nome: payload.nome,
        descricao: payload.descricao,
        tipo: payload.tipo,
        ativo: payload.ativo,
      });

      if (res.status >= 300) {
        const msg = getApiErrorMessage(res.dados, res.statusText);
        setTipo(tipoEnu.Erro);
        setMensagem(msg || "Erro ao incluir fonte.");
        setShowAlerta(true);
        return;
      }

      // ✅ mesmo padrão do GRUPOS
      queryClient.invalidateQueries("fontes");

      setTipo(tipoEnu.Sucesso);
      setMensagem("A fonte foi incluída com sucesso!");
      setShowAlerta(true);

      setIsOpen(false);
      form.reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao incluir a fonte.";
      setTipo(tipoEnu.Erro);
      setMensagem(msg);
      setShowAlerta(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {showAlerta && (
        <WarningBox tipo={tipo} mensagem={mensagem} onCancel={handleFecharWarning} />
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Button
          variant="outline"
          className="hover:bg-slate-100 text-sky-900 border-2 border-sky-800 hover:text-sky-900 text-xl"
          onClick={handleOpen}
        >
          + Fonte
        </Button>

        <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[430px] min-w-[420px] overflow-auto rounded-2xl bg-white p-6 text-gray-900 shadow-lg">
          <SheetHeader>
            <SheetTitle className="text-2xl text-sky-900">Nova fonte financeira</SheetTitle>
          </SheetHeader>

          {isOpen && (
            <div className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome" {...field} />
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
                          <Textarea placeholder="Descrição" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <FormControl>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-44 h-9 text-lg px-2 py-1 flex items-center justify-between hover:bg-slate-200"
                                  >
                                    {field.value === tipoFonte.Aplicacao
                                      ? "Aplicação"
                                      : field.value === tipoFonte.Credito
                                      ? "Crédito"
                                      : "Movimentação"}
                                    <FaChevronDown className="ml-2" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="bg-white">
                                  <DropdownMenuItem onClick={() => field.onChange(tipoFonte.Aplicacao)}>
                                    Aplicação
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => field.onChange(tipoFonte.Credito)}>
                                    Crédito
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => field.onChange(tipoFonte.Movimentacao)}>
                                    Movimentação
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center">
                      <FormField
                        control={form.control}
                        name="ativo"
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center space-y-2">
                            <FormLabel>Ativo</FormLabel>
                            <FormControl>
                              <Checkbox
                                className="border-2 border-sky-900"
                                checked={field.value}
                                onCheckedChange={(v) => field.onChange(Boolean(v))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <SheetFooter className="flex justify-end gap-2 mt-7">
                    <Button
                      variant="outline"
                      type="submit"
                      className="text-lg px-2 py-1 hover:bg-slate-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Incluindo..." : "Incluir"}
                    </Button>

                    <SheetClose asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="text-lg px-2 py-1 hover:bg-slate-200"
                      >
                        Cancelar
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </form>
              </Form>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
