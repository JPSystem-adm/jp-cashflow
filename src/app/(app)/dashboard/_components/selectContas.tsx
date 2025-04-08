"use client"

import { ListaDespesasPeriodo, ListaSubContasPorContas } from "@/app/(app)/actions/graficosActions";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tySelects, tySubGruposGrafico } from "@/types/types";
import { useEffect, useState } from "react";
import { useDashboardContext } from "./contextDashboardProvider";


/**
 * Componente de seleção de contas para o grafico 
 * de destribuição das contas no dashboard
 * @returns 
 */
export default function SelectContas () {
  const [grupos, setGrupos] = useState<tySelects[]>([]);

  const {periodoId} = useGlobalContext();
  const { 
    dadosBarSubContas, setDadosBarSubContas, 
    grupoId, setGrupoId
  } = useDashboardContext();

  useEffect(() => {

    /**
     * Carrega as contas para o select
     * @returns Promise<void>
     */
    async function carregaGrupos() {
      const response = await ListaDespesasPeriodo(periodoId);
      setGrupos(response);
    } 
    /**
     * Carrega as sub-contas para o gráfico de barras
     * @returns Promise<void>
     */
    async function carregaDados() {
      const response: tySubGruposGrafico[] = await ListaSubContasPorContas(periodoId, grupoId);
      setDadosBarSubContas(response);
    }

    async function carrega(){
      await carregaGrupos();
      await carregaDados();
    }
  
    carrega();

  },[periodoId, grupoId, setDadosBarSubContas]);

  /**
   * Função que é chamada quando o select de contas muda
   * atualizando as variaveis de contexto
   * @param value o valor do select
   * @returns true
   */ 
   const onChange = async (value: string) =>{
    setGrupoId(Number(value));
    return true
  }

  return(
    <div>
      <Select defaultValue={"0"} onValueChange={onChange}>
        <SelectTrigger className="w-full text-sky-800 border-2">
          <SelectValue placeholder="Selecione a conta" />
        </SelectTrigger>
        <SelectContent className="border-2 border-sky-900 p-0 m-0">
          <SelectGroup className="bg-white text-sky-900">
            <SelectItem 
              className="bg-sky-100 
              text-sky-900"  
              key={0} 
              value={"0"}
            >
              Todos...
            </SelectItem>
            { grupos?.map((item, index)=>(
              <SelectItem 
                className="bg-sky-100  text-sky-900"  
                key={index} 
                value={item.id?.toString()||""}
              >
                {item.nome}
              </SelectItem>
            )

            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}