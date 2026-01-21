// src/app/(app)/cadastros/grupoDeContas/_components/novoGrupoForm.tsx

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { FaChevronDown } from "react-icons/fa";

import { criarGrupo } from "@/app/(app)/actions/grupoAPI";
import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";

import queryClient from "@/lib/reactQuery";

import { tyGrupoSubGrupo, tySubGrupo, tipoGrupo } from "@/types/types";
import TabelaSubGrupos from "./tabelaSubGrupos";

const schema = z.object({
  nome: z.string().min(2, "Campo obrigatório!"),
  descricao: z.string().min(2, "Campo obrigatório!"),
  ativo: z.boolean().default(true),
  tipo: z.nativeEnum(tipoGrupo, {
    errorMap: () => ({
      message: "Informe 'D' para débito, 'C' para crédito ou 'M' para conta de movimentação.",
    }),
  }),
});

type FormProps = z.infer<typeof schema>;

export default function NovoGrupoForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [subGruposP, setSubGruposP] = useState<tySubGrupo[]>([]);
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Menssagem default");

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      descricao: "",
      tipo: tipoGrupo.Debito,
      ativo: true,
    },
  });

  function handleFechar() {
    setSubGruposP([]);
    setIsOpen(false);
    setShowAlerta(false);
  }

  async function onSubmit(values: FormProps) {
    const novoGrupo: tyGrupoSubGrupo = {
      nome: values.nome,
      descricao: values.descricao,
      tipo: values.tipo,
      ativo: values.ativo,
      subGrupos: subGruposP,
    };

    try {
      const retorno = await criarGrupo(novoGrupo);

      if (retorno.status < 300) {
        setTipo(tipoEnu.Sucesso);
        setMensagem("A conta foi incluida com sucesso!");
        queryClient.invalidateQueries("grupos");
      } else if (retorno.status === 401) {
        setTipo(tipoEnu.Erro);
        setMensagem("Grupo já cadastrado!");
      } else {
        setTipo(tipoEnu.Erro);
        setMensagem("Ocorreu um erro inesperado no servidor!");
      }
    } catch (error) {
      setTipo(tipoEnu.Erro);
      setMensagem(`Ocorreu um erro inesperado! ${String(error)}`);
    } finally {
      setShowAlerta(true);
      setIsOpen(false);
    }
  }

  return (
    <>
      {showAlerta && <WarningBox tipo={tipo} mensagem={mensagem} onCancel={handleFechar} />}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <Button
          variant="outline"
          className="hover:bg-slate-100 text-sky-900 border-2 border-sky-800 hover:text-sky-900 text-base sm:text-xl"
          onClick={() => setIsOpen(true)}
        >
          + Grupo
        </Button>

        <SheetContent
          aria-describedby="descricao-grupo"
          className={[
            // posição central como você já usa
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            // tamanho responsivo (mobile -> desktop)
            "w-[95vw] sm:w-full sm:max-w-2xl lg:max-w-3xl",
            // altura responsiva
            "h-[90vh] max-h-[90vh]",
            // estilo
            "overflow-auto rounded-2xl bg-white p-4 sm:p-6 shadow-lg",
          ].join(" ")}
        >
          <SheetHeader>
            <SheetTitle className="text-xl sm:text-2xl text-sky-900">Novo grupo de Contas</SheetTitle>
            <p id="descricao-grupo" className="text-muted-foreground text-sm">
              Informe os dados do grupo e seus subgrupos
            </p>
          </SheetHeader>

          <div className="mt-6 sm:mt-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Grid responsivo:
                    - mobile: 1 coluna (stack)
                    - >= sm: 12 colunas
                */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-900">Nome</FormLabel>
                          <FormControl>
                            <Input className="placeholder:text-sky-800 border-2 border-sky-900" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-900">Tipo</FormLabel>
                          <FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled={true}>
                                <Button
                                  variant="outline"
                                  className="w-full text-sm flex items-center justify-between hover:bg-slate-200 text-sky-900 border-sky-900"
                                >
                                  {field.value === tipoGrupo.Debito
                                    ? "Débito"
                                    : field.value === tipoGrupo.Credito
                                      ? "Crédito"
                                      : "Movimentação"}
                                  <FaChevronDown />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent className="bg-white text-sm border-2 border-sky-900 text-sky-800">
                                <DropdownMenuItem
                                  className="hover:shadow-xl hover:bg-slate-200 text-sm"
                                  onClick={() => field.onChange(tipoGrupo.Debito)}
                                >
                                  Débito
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="hover:shadow-xl hover:bg-slate-200 text-sm"
                                  onClick={() => field.onChange(tipoGrupo.Credito)}
                                >
                                  Crédito
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="hover:shadow-xl hover:bg-slate-200 text-sm"
                                  onClick={() => field.onChange(tipoGrupo.Movimento)}
                                >
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

                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:mt-5">
                          <FormLabel className="text-sky-900">Ativo</FormLabel>
                          <FormControl>
                            <Checkbox
                              id="ativo"
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
                        <Textarea className="placeholder:text-sky-800 border-2 border-sky-900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botões responsivos:
                    - mobile: empilha
                    - sm+: lado a lado e alinhado à direita
                */}
                <SheetFooter className="text-sm mb-2 font-semibold flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end mt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="text-base sm:text-lg px-3 py-2 hover:bg-slate-200 border-sky-800 border-2"
                    onClick={handleFechar}
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

            <div className="text-sky-900 mt-4">
              <TabelaSubGrupos origem="Novo" grupoId={0} dados={subGruposP} setSubGruposP={setSubGruposP} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
