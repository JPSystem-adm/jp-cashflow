"use client"

import { RetSomatoriasPeriodo } from "@/app/(app)/actions/graficosActions";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { tySomatoriasPeriodo } from "@/types/types";
import { useEffect, useState } from "react";
import { LuCalendarDays, LuInfo } from "react-icons/lu";
import { useDashboardContext } from "./contextDashboardProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface CardContaProps {
  icone: string;
  conta: string;
}

type item = {
  titulo: string;
  valor: number;
}

export default function CardConta({ icone, conta }: CardContaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dadosMovimento, setDadosMovimento] = useState<tySomatoriasPeriodo[]>([]);
  const [detalhes, setDetalhes] = useState<item[]>([]);

  const {periodoId} = useGlobalContext();
  const { dadosBarDespesas, dadosPizzaEntradas } = useDashboardContext();

  const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  useEffect(() => {
    async function carregaMovimentos(){
      const response = await RetSomatoriasPeriodo(periodoId, "GERAL");
      setDadosMovimento(response);
    }

    carregaMovimentos();

  }, [ periodoId]);

  let valor = "";
  if(conta === "Despesas"){
    valor = saldoDespesas();
    //montaDetalhes("Despesas");
  }
  if(conta === "Receitas"){
    valor = saldoReceitas();
  }
  if(conta === "Cartões de crédito"){
    valor=saldoContas("C");
  }
  if(conta === "Saldo disponível"){
    valor=saldoContas("M")
  }
  if(conta === "Investimentos"){
    valor=saldoContas("A")
  }

    /**
   * Função que soma todas as contas de um determinado tipo 
   * (Entrada ou Saída) e retorna o valor formatado em moeda
   * @param tipo Tipo das contas ("M-Movimento" ou "A-Aplicação" ou "C-Crédito")
   * @returns Somatória dos saldos atualizado das contas formatado em moeda
   */
  function saldoContas(tipo: String) {
    const somaContas = dadosMovimento
      .filter((movimento) => movimento.Tipo === tipo)
      .reduce((soma, movimento) => soma + movimento.saldoAtual, 0);
      const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    
      return formatoMoeda.format(somaContas);
  }
  
  function saldoDespesas() {
    const somaDespesas = dadosBarDespesas
      .reduce((soma, despesa) => soma + despesa.valorReal, 0);
      const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    
      return formatoMoeda.format(somaDespesas);
  }

  function montaDetalhes() {
    const dados:item[] = [];
    if(conta === "Despesas"){
        dadosBarDespesas.map((despesa) => {
          const item: item = {
            titulo: despesa.Grupo,
            valor: despesa.valorReal
          };
          dados.push(item);
        })
    }
    if(conta === "Receitas"){
      dadosPizzaEntradas.map((receita) => {
        const item: item = {
          titulo: receita.SubGrupo,
          valor: receita.valorReal
        };
        dados.push(item);
      })
    }
    if(conta === "Cartões de crédito"){
      dadosMovimento.map((dado) => {
        const item: item = {
          titulo: dado.Fonte,
          valor: dado.saldoAtual         
        };
        if(dado.Tipo === "C"){
          dados.push(item);
        }
      })
    }
    if(conta === "Saldo disponível"){
      dadosMovimento.map((dado) => {
        const item: item = {
          titulo: dado.Fonte,
          valor: dado.saldoAtual        
        };
        if(dado.Tipo === "M"){
          dados.push(item);
        }
      })
    }
    if(conta === "Investimentos"){
      dadosMovimento.map((dado) => {
        const item: item = {
          titulo: dado.Fonte,
          valor: dado.saldoAtual         
        };
        if(dado.Tipo === "A"){
          dados.push(item);
        }
      })
    }


    setDetalhes(dados);
  }

  function saldoReceitas() {
    const somaEntradas = dadosPizzaEntradas
      .reduce((soma, entrada) => soma + entrada.valorReal, 0);
      const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    
      return formatoMoeda.format(somaEntradas);
  }

  return (
    <>
      <div className="flex w-full  flex-col  text-sky-800 ">
        <div className="flex justify-items-start space-x-2 text-sky-800 ">
          <Avatar>
            <AvatarImage src={"/" + icone} />
            <AvatarFallback>
              <LuInfo />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0 pl-10">
            <h1 className="text-2xl font-semibold text-sky-900">{conta}</h1>
            <h1 className="text-2xl font-bold text-sky-800">
              {valor}
            </h1>
          </div>
        </div>
        <div className="flex pt-2">
          <Accordion 
            className="w-full "
            type="single" 
            defaultValue={isOpen ? "item-1" : undefined}
            collapsible
            onClick={() => montaDetalhes()}
            onValueChange={(value) => setIsOpen(value === "item-1")} 
          >
            <AccordionItem value={"item-1"}>
              <AccordionTrigger>
                {/* <LuCalendarDays className="mr-2 h-4 w-4 opacity-70" />{" "} */}
                <span className="text-lg text-muted-foreground opacity-70 text-sky-800 ">
                  {isOpen ? "Fechar Detalhes..." : "Mostrar Detalhes..."}
                </span>
              </AccordionTrigger>
              <AccordionContent>
              <table className="text-sky-800 text-lg w-[90%]">
                <tbody className="">
                  {detalhes.map((item) => (                  
                  <tr className="text-lg " key={item.titulo}>
                    <td className="text-lg font-bold text-sky-950 w-[40%]">{item.titulo}</td>
                    <td className="text-lg text-sky-800 w-[60%] text-right">{formatoMoeda.format(item.valor)}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
