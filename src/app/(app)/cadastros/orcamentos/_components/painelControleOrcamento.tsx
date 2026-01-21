// src/app/(app)/cadastros/orcamentos/_components/painelControleOrcamento.tsx

"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "react-query";

import { useOrcamentoContext } from "./contextProvider";
import { useGlobalContext } from "@/app/(app)/contextGlobal";

import {
  listarOrcamentos,
  gerarOrcamentos,
  atualizarOrcamentos,
  contarGruposAtivos,
  type OrcamentoRow,
} from "@/app/(app)/actions/orcamentoAPI";

export default function PainelControleOrcamento() {
  const qc = useQueryClient();
  const { dados, setDados } = useOrcamentoContext();
  const { periodoId, periodo } = useGlobalContext();

  const periodoValido = periodoId > 0;

  // 1) Buscar orçamentos do período
  const { data: rows = [], isLoading } = useQuery(
    ["orcamentos", periodoId],
    () => listarOrcamentos(periodoId),
    {
      enabled: periodoValido,
      refetchOnWindowFocus: false,
      retry: 0,
      initialData: [],
      onSuccess: (data: OrcamentoRow[]) => {
        // mantém Context sincronizado com o cache do react-query
        setDados(data);
      },
    }
  );

  // 2) Contar quantos grupos ativos existem (pra saber se tem grupos novos)
  const { data: qtdGrupos = 0, isLoading: isLoadingGrupos } = useQuery(
    ["orcamentos-qtd-grupos", periodoId],
    () => contarGruposAtivos(periodoId),
    {
      enabled: periodoValido,
      refetchOnWindowFocus: false,
      retry: 0,
      initialData: 0,
    }
  );

  const temOrcamentos = useMemo(() => rows.length > 0, [rows.length]);

  // regra dos botões (igual ao Saldo)
  const podeCriar = periodoValido && !isLoading && !temOrcamentos;
  const podeAtualizar =
    periodoValido &&
    !isLoading &&
    !isLoadingGrupos &&
    dados.length > 0 &&
    qtdGrupos > dados.length;

  const onCriar = async () => {
    try {
      await gerarOrcamentos(periodoId);

      await qc.invalidateQueries(["orcamentos", periodoId]);
      await qc.invalidateQueries(["orcamentos-qtd-grupos", periodoId]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar orçamentos";
      alert(msg);
    }
  };

  const onAtualizar = async () => {
    try {
      await atualizarOrcamentos(periodoId);

      await qc.invalidateQueries(["orcamentos", periodoId]);
      await qc.invalidateQueries(["orcamentos-qtd-grupos", periodoId]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar orçamentos";
      alert(msg);
    }
  };

  return (
    <div className="pb-6 flex flex-col w-full items-center">
      <Card className="border-sky-900 border-2 w-full sm:w-[92%] md:w-[80%] lg:w-[70%]">
        <CardContent className="py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex justify-center sm:justify-start">
              <Label className="text-lg font-bold">{`Periodo ${periodo}`}</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                disabled={!podeCriar}
                className="border-2 border-sky-900 text-sm text-sky-900 hover:bg-sky-200"
                onClick={onCriar}
              >
                Criar Orçamentos
              </Button>

              <Button
                variant="outline"
                disabled={!podeAtualizar}
                className="border-2 border-sky-900 text-sm text-sky-900 hover:bg-sky-200"
                onClick={onAtualizar}
              >
                Atualizar Orçamentos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
