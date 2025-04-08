"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FaChevronDown } from "react-icons/fa";
import { NovoGrupoComSubgrupos } from "@/app/app/actions/grupoActions";
import { tyGrupo, tySubGrupo, tyResult, tipoGrupo } from "@/types/types";
import queryClient from "@/lib/reactQuery";
import { WarningBox, tipoEnu } from "@/app/_components/warningBox";
import {useSession } from "next-auth/react"
import TabelaSubGrupos from "./tabelaSubGrupos";


// Configurando o zod para validação do formulário
const schema = z.object({
  nome: z.string().min(2, "Campo obrigatório!"),
  descricao: z.string().min(2, "Campo obrigatório!"),
  ativo: z.boolean().default(true),
  tipo: z
  .nativeEnum(tipoGrupo, {
    errorMap: () => ({
           message:
           "Informe 'D' para débito, 'C' para crédito ou 'M' para conta de movimentação.",
    }),
  }),
});

type FormProps = z.infer<typeof schema>;

export default function NovoGrupoForm() {
  const { data: session } = useSession();
  
    // Função para fechar a SHEET
    const handleClose = () => {
      //form.reset();
      setSubGruposP([]);
      setIsOpen(false);
    };

  // Variavel de estado isOpen para controle 
  // do formulario de edição dos dados (NovoGrupoForm)
  const [isOpen, setIsOpen] = useState(false);

  // Variavel de estado para evitar a execução no reeload do componente
  // isSubmit só fica true se for clicado em Incluir
  const [isSubmit, setIsSubmit] = useState(false);
  //um array para manipular os dados do subgrupo na lista
  //ante de enviar para o banco de dados
  const [subGruposP, setSubGruposP] = useState<tySubGrupo[]>([]);

  //Variaveis para a caixa de avisos (WarningBox)
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Menssagem default");

  //Função para fechar o formulário de edição dos dados
  const handleFechar=()=>{
    setSubGruposP([]);
    setIsOpen(false);
    setShowAlerta(false);
  };



  // Definição do formulário
  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      descricao: "",
      tipo: tipoGrupo.Debito,
      ativo: true,
    },
  });

  // Função para abrir o formulário de edição dos dados
  const handleOpen = () => {
    form.resetField("nome");
    form.resetField("descricao");
    form.resetField("tipo");
    form.resetField("ativo");
    setIsOpen(true);
  };

  // Função para executar no Submit
  function onSubmit(values: FormProps) {
    const novoGrupo: tyGrupo = {
      nome: values.nome,
      descricao: values.descricao,
      tipo: values.tipo,
      ativo: values.ativo,
      userId: session?.user.id,
    };
    if (isSubmit) {
      incluirGrupo(novoGrupo, subGruposP);
      setIsOpen(false);
    }
  }

  //Função para incluir uma novo grupo com seus subgrupos
  async function incluirGrupo( dadosGrupo: tyGrupo, dadosSubGrupos: tySubGrupo[]) {
    let retorno:tyResult ;
    try {      
      retorno = await NovoGrupoComSubgrupos(dadosGrupo, dadosSubGrupos)
      if(retorno.status === "Sucesso"){
        setTipo(tipoEnu.Sucesso);
        setMensagem(`A conta foi incluida com sucesso!` );
        setShowAlerta(true);
        //Limpar o cache da consulta para atualizar os dados
        queryClient.invalidateQueries("grupos")        
      }else{
        if(retorno.menssagem === "P2002")
        {
          setTipo(tipoEnu.Erro);
          setMensagem("Grupo já cadastrado!" );
          setShowAlerta(true);
        }else{
          setTipo(tipoEnu.Erro);
          setMensagem("O correu um erro inesperado no servidor!" );
          setShowAlerta(true);
        }
      }
      
    } catch (error) {
      setTipo(tipoEnu.Erro);
      setMensagem(`Ocorreu um erro inesperado! ${error}` );
      setShowAlerta(true);
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
          className="hover:bg-slate-100 text-sky-900 border-2 border-sky-800 hover:text-sky-900 text-xl"
          onClick={handleOpen}
        >
          + Grupo
        </Button>
        <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2  max-h-[600px] min-w-[780px] overflow-auto rounded-2xl bg-white p-6 shadow-lg">
          <SheetHeader>
            <SheetTitle className="text-2xl text-sky-900">
              Novo grupo de Contas
            </SheetTitle>
          </SheetHeader>
          {isOpen && (
            <div className="mt-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-900">Nome</FormLabel>
                            <FormControl>
                              <Input
                                className="placeholder:text-sky-800 border-2 border-sky-900"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-5">
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
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="ativo"
                        render={({ field }) => (
                          <FormItem className="col-span-1 flex flex-col items-center mt-5">
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
                          <Textarea
                            className="placeholder:text-sky-800 border-2 border-sky-900"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-sm font-semibold flex justify-end mt-7 text-sky-900">
                    <SheetFooter className="text-sm mb-4 font-semibold flex justify-end mt-7">
                      <Button
                        variant="outline"
                        className="text-lg px-2 py-1 hover:bg-slate-200 border-sky-800 border-2"
                        type="submit"
                        onClick={() => setIsSubmit(true)}
                      >
                        Incluir
                      </Button>
                      <Button
                        variant="outline"
                        className="text-lg px-2 py-1 hover:bg-slate-200 border-sky-800 border-2"
                        onClick={handleClose}
                      >
                        Cancelar
                      </Button>
                    </SheetFooter>
                  </div>
                </form>
              </Form>
              <div className="text-sky-900">
                <TabelaSubGrupos
                  origem="Novo"
                  grupoId={0}
                  dados={subGruposP}
                  setSubGruposP={setSubGruposP}
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
