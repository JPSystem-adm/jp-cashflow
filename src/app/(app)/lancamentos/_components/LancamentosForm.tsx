"use client";

import { Input } from "@/components/ui/input";
import { startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale"; // Importa a localização em português
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import DatePicker from "react-datepicker";
import ComboGrupos from "./querys/selectGrupos";
import ComboSubGrupos from "./querys/selectSubGrupos";
import ComboFontes from "./querys/selectFontes";
import { Label } from "@/components/ui/label";
import { useLancamentoContext } from "./contextLancamentoProvider";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { tyLancamento, tyResult } from "@/types/types";
import { RealBRToDouble, retDataDoPeriodo } from "@/lib/formatacoes";
import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
import { CriarLancamento } from "@/app/(app)/actions/lancamentoActions";
import queryClient from "@/lib/reactQuery";

// Definição dos tipos de dados do formulário
type FormProps = {
  valor: string;
  descricao: string;
  dtLancamento: Date | null;
};

// Schema de validação com zod
const schema = z.object({
  //valor: z.string().min(1, "Campo obrigatório!"),
  valor: z.string().regex(/^\R?\$?\s?\d+(.\d{3})*(\,\d{0,2})?$/, 'Valor monetário inválido'),
  descricao: z.string().min(1, "Campo obrigatório!"),
  dtLancamento: z.date(),
});

export default function NovoLancamentosForm() {
  const { formGrupoId, setFormGrupoId, 
          formSubGrupoId, setFormSubGrupoId,
          formFonteIdO, setFormFonteIdO, 
          formFonteIdD, setFormFonteIdD,
          setDados, operacao, setOperacao,
          grupoId, subGrupoId, fonteId
  } = useLancamentoContext();
  const { periodoId, periodo } = useGlobalContext();

  const [selDate, setSelDate] = useState<Date>(retDataDoPeriodo(periodo));

  const [isOpen, setIsOpen] = useState(false);

  //Variaveis para a caixa de avisos (WarningBox)
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Menssagem default");

  //Função para fechar a caixa de aviso
  const handleFechar=()=>{
    setShowAlerta(false);
  };

  

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      valor: "",
      descricao: "",
      dtLancamento: selDate,
    },
  });

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    setFormGrupoId(0);
    setFormSubGrupoId(0);
    setFormFonteIdO(0);
    setFormFonteIdD(null);
    setOperacao("") 
    setIsOpen(false);
    form.reset();
  };

  const onSubmit = (values: FormProps) => {
    if(formSubGrupoId === 0){
      setTipo(tipoEnu.Alerta);
      setMensagem("É necessário secionar uma subConta!" );
      setShowAlerta(true);
      return
    }
    if(formFonteIdO === 0){
      setTipo(tipoEnu.Alerta);
      setMensagem("É necessário secionar uma fonte!" );
      setShowAlerta(true);
      return
    }
    const novoLancamento:tyLancamento = {
      grupoId: formGrupoId,
      subGrupoId: formSubGrupoId,
      fonteId: formFonteIdO || undefined,
      fonteIdD : formFonteIdD,
      periodoId: periodoId,
      valor : RealBRToDouble(values.valor),
      descricao : values.descricao,
      dtLancamento : values.dtLancamento?.toUTCString() ?? undefined,
      operacao : operacao,
    };
    incluirLancamento(novoLancamento);
    handleClose();
  };

  //Função para incluir o lançamento
  async function incluirLancamento(dadosLancamento: tyLancamento){
    let retorno:tyResult ;
    console.log("Dados do Lançamento: ", dadosLancamento);
    try {      
      retorno = await CriarLancamento(dadosLancamento);
      console.log("Retorno da inclusão: ", retorno);
      if(retorno.status === "Sucesso"){
        setTipo(tipoEnu.Sucesso);
        setMensagem(`A fonte foi incluida com sucesso!` );
        setShowAlerta(true);   
         //Limpar o cache da consulta para atualizar os dados
         queryClient.refetchQueries(["lancamentos", periodoId, grupoId, subGrupoId, fonteId])   

      }else{
        if(retorno.menssagem === "P2002"){
            setTipo(tipoEnu.Erro);
            setMensagem("A fonte já está cadastrada!" );
            setShowAlerta(true);
        }else{
            setTipo(tipoEnu.Erro);
            setMensagem("O correu um erro inesperado no servidor! " + retorno.menssagem  );
            setShowAlerta(true);
        }
      }
    } catch (error) {
      setTipo(tipoEnu.Erro);
      setMensagem(`Ocorreu um erro inesperado! ${error}` );
      setShowAlerta(true);      
    }
  }



  // Calcula o primeiro e o último dia do mês atual
  const currentDate = selDate //retDataDoPeriodo(periodo); //new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

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
      <div className="flex flex-col">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              className="border-2 text-sky-900 border-sky-900 hover:text-sky-800 hover:border-sky-700"
              variant="outline"
              onClick={handleOpen}
            >
              + Lançamentos
            </Button>
          </SheetTrigger>
          <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[500px] max-h-[500px] min-w-[800px] max-w-[800px] overflow-x-auto rounded-2xl bg-white p-8 text-sky-800 shadow">
            <SheetHeader>
              <SheetTitle className="text-sky-900">Novo Lançamento</SheetTitle>
                <SheetDescription className="text-muted-foreground text-sm">
                  Preencha os dados do lançamento financeiro
                </SheetDescription>
            </SheetHeader>
            {/* CONTA E SUBCONTA */}
            <div className="flex gap-2 mb-2" >
              <div className="flex-1">
                <Label className="block text-sm font-medium text-sky-900">
                    Conta
                </Label>
                <ComboGrupos pai="Form"/>
              </div>
              <div className="flex-1">
                <Label className="block text-sm font-medium text-sky-900">
                    Sub-Conta
                </Label>
                <ComboSubGrupos pai="Form"/>
              </div>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div>
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sky-900 caret-sky-900">
                          Descrição
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="placeholder:text-sky-900 w-full"
                            placeholder="Descrição"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-sky-900">Valor</FormLabel>
                        <FormControl>
                          <Input
                            className="placeholder:text-sky-900 w-full text-lg"
                            placeholder="Valor"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dtLancamento"
                    render={({ field }) => (
                      <FormItem className="flex-1 ">
                        <FormLabel className="text-sky-900">Data</FormLabel>
                        <FormControl>
                          <div className="relative border-sky-800 ">
                            <DatePicker
                              showIcon
                              icon="fa fa-calendar"
                              selected={field.value}
                              onChange={(date) => field.onChange(date)}
                              dateFormat="E - dd/MMMM"
                              minDate={firstDayOfMonth}
                              maxDate={lastDayOfMonth}
                              className="text-sky-800 border-sky-900 rounded-md text-center h-9 pb-1 w-[362px] text-lg hover:bg-slate-100"
                              showMonthDropdown={false}
                              showYearDropdown={false}
                              showPopperArrow={false}
                              isClearable={false}
                              locale={ptBR} // Configura a localização para português
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
                  ></link>
                </div>
                {/* FONTE E DESTINO */}
                <div className="flex gap-2 mt-2" >
                  <div className="flex-1">
                    <Label className="block text-sm font-medium text-sky-900">
                        Fonte
                    </Label>
                    <ComboFontes pai="FormO"/>
                  </div>

                  <div className={`flex-1 ${operacao !== 'M'? 'invisible' : '' } `}>
                    <Label className="block text-sm font-medium text-sky-900">
                        Destino
                    </Label>
                    <ComboFontes pai="FormD"/>
                  </div>

                </div>
                <SheetFooter className="mt-7">
                  <Button
                    type="submit"
                    variant="outline"
                    className="h-9 w-22 border-2 text-sky-900 border-sky-800 hover:text-sky-50 hover:bg-sky-900"
                  >
                    Confirmar
                  </Button>
                  <SheetClose asChild>
                    <Button
                      className="h-9 w-22 border-2 text-sky-900 border-sky-800 hover:text-sky-50 hover:bg-sky-900"
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
    </>
  );
}
