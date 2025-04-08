"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery} from 'react-query';
import queryClient from "@/lib/reactQuery";
import { AtualizaOrcamentos, CriarOrcamentos, gruposAtivos, RetOrcamento, VerificaPeriodo } from "@/app/(app)/actions/orcamentoActions";
import { tyOrcamento, tyResult } from "@/types/types";
import { useOrcamentoContext } from "./contextProvider";
import { useGlobalContext } from "@/app/(app)/contextGlobal";

export default function PainelControleOrcamento (){
  const {dados, setDados} = useOrcamentoContext();
  const {usuarioId, setUsuarioId, periodoId, setPeriodoId, periodo, setPeriodo} = useGlobalContext();

  const [qtdGrupos, setQtdGrupos] = useState<number>(0)

  useEffect(()=>{
    const fetchData = async () =>{
      try {
        const retorno = await retQtdGrupos();
        setQtdGrupos(retorno);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    }
    fetchData();
  })

  //Carrega os Orcamentos
  const { data, isLoading, refetch } = useQuery( ["orcamentos", periodoId], async () => {
    const response:tyOrcamento[] = await RetOrcamento(periodoId);
    setDados(response);
    return response;
  })

  const retQtdGrupos = async () =>{
    const resultado:number = await gruposAtivos(periodoId, usuarioId);
    return resultado
  }


  const incluirOrcamentos = async () =>{
    let retorno:tyResult ;
    try {
      retorno = await CriarOrcamentos(periodoId, usuarioId);
       //Limpar o cache da consulta para atualizar os dados
       queryClient.refetchQueries(["orcamentos", periodoId]);   
    } catch (error) {
      
    }
  }

  const atualizarOrcamentos = async () =>{
    let retorno:tyResult ;
    try {
      retorno = await AtualizaOrcamentos(periodoId, usuarioId);

       //Limpar o cache da consulta para atualizar os dados
       queryClient.refetchQueries(["orcamentos", periodoId]);   
    } catch (error) {
      
    }
  }


  return(
    <div className="pb-8 flex flex-col w-full items-center">
      <Card className="border-sky-900 border-2 w-[90%]">
        <CardContent className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
          <div className="flex flex-1 gap-4 justify-end">
            <div className="flex w-[30%] max-w-xs">
              <Label className="text-lg font-bold">{`Periodo ${periodo}`}</Label>
            </div>
            <div className="flex flex-col w-[30%] max-w-xs">
              <Button
                variant="outline" 
                disabled={!(dados?.length === 0 && periodoId > 0)}
                className="border-2 border-sky-900 text-sm"
                onClick={incluirOrcamentos}
              >Criar Orçamentos</Button>
            </div>
            <div className="flex flex-col w-[30%] max-w-xs">
              <Button
                variant="outline" disabled={!(dados.length > 0 && qtdGrupos > dados.length)}
                className="border-2 border-sky-900 text-sm"
                onClick={atualizarOrcamentos}
              >Atualizar Orçamentos</Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}