"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import DatePicker from "react-datepicker";
//import "react-datepicker/dist/react-datepicker.css";
import { startOfMonth, endOfMonth, } from "date-fns";
import { ptBR } from "date-fns/locale"; 
import { RealBRToDouble, DoubleToRealBR, retDataDoPeriodo } from "@/lib/formatacoes"; 
import { tyLancamento, tyResult } from "@/types/types";
import queryClient from "@/lib/reactQuery";
import { useLancamentoContext } from "./contextLancamentoProvider";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import ComboGrupos from "./querys/selectGrupos";
import ComboSubGrupos from "./querys/selectSubGrupos";
import { useState } from "react";
import ComboFontes from "./querys/selectFontes";
import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
import { AlteraLancamento } from "@/app/(app)/actions/lancamentoActions";

// Definição dos tipos de dados do formulário
type Props = {
  pItem?: tyLancamento;
  pIndice: number;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
};

type FormProps = {
  valor: string;
  descricao: string;
  dtLancamento: Date | null;
}

// Schema de validação com zod
const schema = z.object({
  valor: z.string().regex(/^\R?\$?\s?\d+(.\d{3})*(\,\d{0,2})?$/, 'Valor monetário inválido'),
  descricao: z.string().min(1, "Campo obrigatório!"),
  dtLancamento: z.date(),
});

export default function EditaLancamentoForm ({pItem, pIndice, isEdita, setIsEdita}: Props) {

  const { formGrupoId, setFormGrupoId, 
    formSubGrupoId, setFormSubGrupoId,
    formFonteIdO, setFormFonteIdO, 
    formFonteIdD, setFormFonteIdD,
    setDados, operacao, setOperacao,
    grupoId, subGrupoId, fonteId
} = useLancamentoContext();

  const { periodoId, periodo } = useGlobalContext();
  const [selDate, setSelDate] = useState<Date>(retDataDoPeriodo(periodo));

  //Variaveis para a caixa de avisos (WarningBox)
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Menssagem default");

  //Função para fechar a caixa de aviso
  const handleFechar=()=>{
    setShowAlerta(false);
    handleClose();
  };

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      valor: DoubleToRealBR(pItem?.valor || 0),
      descricao: pItem?.descricao,
      dtLancamento: pItem?.dtLancamento ? new Date(pItem.dtLancamento) : null
    },
  });

  const handleClose = () => {
    setFormGrupoId(0)
    setFormSubGrupoId(0)
    setFormFonteIdO( 0)
    setFormFonteIdD(null)
    setOperacao("") 
    setIsEdita(false);
    form.reset();
  };

  //Finção a ser executada ao submeter o formulário
  const onSubmit = async (values: FormProps) => {
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

    const novoLancamento: tyLancamento = {
      lancamentoId: pItem?.lancamentoId,
      subGrupoId: formSubGrupoId,
      fonteId: formFonteIdO || undefined,
      fonteIdD : formFonteIdD,
      valor : RealBRToDouble(values.valor),
      descricao : values.descricao,
      dtLancamento : values.dtLancamento?.toUTCString() ?? undefined,
    };
    altLancamento(novoLancamento); 
  };

    //Função para incluir uma nova fonte
    async function altLancamento(dadosLancamento: tyLancamento){
      let retorno:tyResult ;
      
      try {      
        retorno = await AlteraLancamento(dadosLancamento);
        console.log("retorno", retorno);
        if(retorno.status === "Sucesso"){
          setTipo(tipoEnu.Sucesso);
          setMensagem(`O lançamento foi alterado com sucesso!` );
          setShowAlerta(true);   
          //Limpar o cache da consulta para atualizar os dados
          queryClient.refetchQueries(["lancamentos", periodoId, grupoId, subGrupoId, fonteId ]) 
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

  // Calcula o primeiro e o último dia do mês atual
  const currentDate = selDate //retDataDoPeriodo(periodo); //new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  return (
    <div className="flex flex-col">
      { showAlerta && (
          <WarningBox
            tipo={tipo}
            mensagem={mensagem}
            onCancel={handleFechar}
          />
        )
      }       
      <Sheet open={isEdita} onOpenChange={setIsEdita}>
        <SheetContent 
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[500px] max-h-[500px] min-w-[800px] max-w-[800px] overflow-x-auto rounded-2xl bg-white p-8 text-sky-800 shadow"  
        >
          <SheetTitle className="text-sky-900 mb-412">Editar Lançamento</SheetTitle>
          <SheetDescription className="text-sky-600 bold mb-4">Formulário para edição do lançamento.</SheetDescription>
          {/* CONTA E SUBCONTA */}
          <div className="flex gap-2 mb-2" >
            <div className="flex-1 pointer-events-none  opacity-50">
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
  );
};

