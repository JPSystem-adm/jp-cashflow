"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery } from "react-query";
import queryClient from "@/lib/reactQuery";
import { AtualizaSaldo, AtualizaSaldos, CriarSaldos, fontesAtivas, RetSaldos } from "@/app/(app)/actions/saldosActions";
import { tySaldo, tyResult, tySomatoriasPeriodo } from "@/types/types";
import { useSaldoContext } from "./contextSaldosProvider";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { RetSomatoriasPeriodo } from "@/app/(app)/actions/graficosActions";

export default function PainelControleSaldo() {
  const {dados, setDados} = useSaldoContext();
  const { usuarioId, periodoId, periodo } = useGlobalContext();

  const { data, isLoading, refetch } = useQuery(["saldos", periodoId], async () => {
      // const response: tySaldo[] = await RetSaldos(periodoId);
      // const response: tySomatoriasPeriodo[] = await RetSaldos(periodoId);
      const response: tySomatoriasPeriodo[] = await RetSomatoriasPeriodo(periodoId, "normal");
      setDados(response);
      return response;
    }
  );

  const incluirSaldos = async () =>{
    console.log("Click em Incluir Saldos", usuarioId, periodo);
    let retorno:tyResult ;
    try {
      console.log("Entrou no try:", usuarioId, periodo);
      retorno = await CriarSaldos(periodo, usuarioId);
      console.log("RETORNO", retorno);

       //Limpar o cache da consulta para atualizar os dados
       queryClient.refetchQueries(["saldos", periodoId]);   
    } catch (error) {
      
    }
  }

  const atualizarSaldos = async () =>{
    let retorno:tyResult ;
    try {
      retorno = await AtualizaSaldos(periodoId, usuarioId);
       //Limpar o cache da consulta para atualizar os dados
       queryClient.refetchQueries(["saldos", periodoId]);   
    } catch (error) {
      
    }
  }

  return (
    <div className="pb-8 flex flex-col w-full items-center">
      <Card className="border-sky-900 border-2 w-[70%]">
        <CardContent className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-3">
          <div className="flex flex-1 gap-4 justify-between">
            <div className="flex w-[50%] max-w-xs">          
              <Label className="text-lg font-bold">{`Periodo ${periodo}`}</Label>
            </div>
            <div className="flex flex-row w-[50%] max-w-xs justify-between">
              <Button
                variant="outline"
                disabled={!(dados?.length === 0 && periodoId > 0)}
                className="border-2 border-sky-900 text-sm text-sky-900 hover:bg-sky-200"
                onClick={incluirSaldos}
              >
                Criar Saldos
              </Button>
              <Button
                variant="outline"
                disabled={(dados?.length === 0 && periodoId > 0)}
                className="border-2 border-sky-900 text-sm text-sky-900 hover:bg-sky-200"
                onClick={atualizarSaldos}
              >
                Atualizar Saldos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
