// src/app/(app)/cadastros/saldos/_components/painelControleSaldo.tsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { tySomatoriasPeriodo } from "@/types/types";

import { ensurePeriodo } from "@/app/(app)/actions/periodoAPI";
import { listarSaldos, gerarSaldos, atualizarSaldos } from "@/app/(app)/actions/saldoAPI";
import { useSaldoContext } from "./contextSaldosProvider";

export default function PainelControleSaldo() {
  const qc = useQueryClient();

  const { periodo, periodoId, setPeriodoId } = useGlobalContext();
  const { setRows } = useSaldoContext();

  // evita chamar ensurePeriodo duas vezes (StrictMode)
  const ensuredRef = useRef(false);

  // 1) Garantir periodoId (se vier 0)
  useEffect(() => {
    const run = async () => {
      if (periodoId > 0) return;
      if (ensuredRef.current) return;
      ensuredRef.current = true;

      try {
        const id = await ensurePeriodo(periodo);
        if (typeof id === "number" && id > 0) setPeriodoId(id);
      } catch (e) {
        console.error("Falha ao garantir período no painel de saldos:", e);
      }
    };

    void run();
  }, [periodo, periodoId, setPeriodoId]);

  const periodoValido = periodoId > 0;

  // 2) Buscar saldos do período (TanStack v5: assinatura por objeto)
  const { data: rows = [], isLoading } = useQuery<tySomatoriasPeriodo[], Error>({
    queryKey: ["saldos", periodoId],
    enabled: periodoValido,
    refetchOnWindowFocus: false,
    retry: 0,
    queryFn: async (): Promise<tySomatoriasPeriodo[]> => {
      if (!periodoValido) return [];
      const res = await listarSaldos(periodoId);
      return Array.isArray(res) ? (res as tySomatoriasPeriodo[]) : [];
    },
  });

  // ✅ 2.1) Sincroniza com o contexto (isso destrava a tabela)
  useEffect(() => {
    setRows(rows);
  }, [rows, setRows]);

  const temSaldos = useMemo(() => rows.length > 0, [rows.length]);

  // 3) regra dos botões
  const podeCriar = periodoValido && !isLoading && !temSaldos;
  const podeAtualizar = periodoValido && !isLoading && temSaldos;

  const onCriar = async () => {
    try {
      await gerarSaldos(periodo);
      await qc.invalidateQueries({ queryKey: ["saldos", periodoId] });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar saldos";
      alert(msg);
    }
  };

  const onAtualizar = async () => {
    try {
      await atualizarSaldos(periodoId);
      await qc.invalidateQueries({ queryKey: ["saldos", periodoId] });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao atualizar saldos";
      alert(msg);
    }
  };

  return (
    <div className="pb-8 flex flex-col w-full items-center">
      <Card className="border-sky-900 border-2 w-full sm:w-[92%] md:w-[80%] lg:w-[70%]">
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
            <div className="flex">
              <Label className="text-lg font-bold">{`Periodo ${periodo}`}</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                disabled={!podeCriar}
                className="border-2 border-sky-900 text-sm text-sky-900 hover:bg-sky-200"
                onClick={onCriar}
              >
                Criar Saldos
              </Button>

              <Button
                variant="outline"
                disabled={!podeAtualizar}
                className="border-2 border-sky-900 text-sm text-sky-900 hover:bg-sky-200"
                onClick={onAtualizar}
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
