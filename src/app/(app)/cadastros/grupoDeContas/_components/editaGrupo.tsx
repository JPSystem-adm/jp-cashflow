"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlteraGrupo, RetGrupo, RetSubGrupos } from "@/app/(app)/actions/grupoActions";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import React, { FormEventHandler, useEffect, useState } from "react";
import TabelaSubGrupos from "./tabelaSubGrupos";
import { Textarea } from "@/components/ui/textarea";
import { tyGrupo, tySubGrupo, tipoGrupo, tyResult } from "@/types/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FaChevronDown } from "react-icons/fa"; // Ícone de seta para baixo
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import queryClient from "@/lib/reactQuery";
import { WarningBox, tipoEnu } from "@/app/_components/warningBox";

interface Props {
  pIndice: number;
  pItem: tyGrupo | undefined;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
}

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

export default function EditaGrupoForm({ pIndice, pItem, isEdita, setIsEdita }: Props) {
  //O variavel isEdita substitui isOpen e é tratada no formulario pai e serve
  //para controle do formulario de edição doso dados (EditaGrupoForm)

  //Função para fechar a SHEET
  const handleClose = () => {
    setIsEdita(false);
  };

  //Definição do formulario
  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: { 
      nome: pItem?.nome,
      descricao: pItem?.descricao,
      tipo: pItem?.tipo,
      ativo: (pItem?.ativo? true: false),
    },
  });

  //um array para manipular os dados do grupo
  //ante de enviar para o banco de dados
  const [grupoP, setGrupoP] = useState<tyGrupo | undefined>(pItem);
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
    setShowAlerta(false);
    if(tipo === tipoEnu.Sucesso){
      setIsEdita(false);
    }
  };

  function onSubmit(values: FormProps, e: any) {
    //e.preventDefault();
    const novoGrupo: tyGrupo = {
      id: grupoP?.id,
      nome: values.nome,
      descricao: values.descricao,
      tipo: values.tipo,
      ativo: values.ativo,
    };
    altGrupo(novoGrupo);

  }

  async function altGrupo(dadosGrupo: tyGrupo) {
    let retorno:tyResult ;
    try {
      retorno = await AlteraGrupo(dadosGrupo)
      if(retorno.status === "Sucesso"){
        setTipo(tipoEnu.Sucesso);
        setMensagem(`A grupo foi alterado com sucesso!` );
        setShowAlerta(true);
        queryClient.invalidateQueries("grupos")        
      }else{
        if(retorno.menssagem === "P2002")
        {
          setTipo(tipoEnu.Erro);
          setMensagem("Erro de relacionamento!" );
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
    <Sheet open={isEdita} onOpenChange={setIsEdita} >
      <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[600px] min-w-[780px] overflow-auto rounded-2xl bg-white p-6 shadow-lg">
        <SheetHeader>
          <SheetTitle className="text-2xl text-sky-900">Editar grupo de Contas </SheetTitle>
        </SheetHeader>
        {isEdita && (
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
                              disabled={field.value === "ENTRADA" ? true : field.value === "TRANSFERENCIAS" ? true : false}
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
                      <FormLabel className="text-sky-900">
                        Descrição
                      </FormLabel>
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
                  <SheetFooter className="text-sm mb-8 font-semibold flex justify-end mt-7">
                    <Button
                      variant="outline"
                      className="text-lg px-2 py-1 hover:bg-slate-200 border-sky-800 border-2"
                      type="submit"
                      //onClick={() => setIsSubmit(true)}
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      className="text-lg px-2 py-1 hover:bg-slate-200 border-sky-800 border-2 ml-3"
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
                origem="Edicao"
                grupoId={pIndice}
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
