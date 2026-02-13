// src/app/(app)/cadastros/saldos/_components/ExtratoFonteModal.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DoubleToRealBR } from "@/lib/formatacoes";
import { getTokenFromCookie } from "@/lib/getToken";
import { X } from "lucide-react";

type ExtratoLinha = {
  id: number;
  data: string; // YYYY-MM-DD
  descricao: string;
  entrada: number;
  saida: number;
  saldo: number;
};

type ExtratoResponse = {
  fonteId: number;
  periodoId: number;
  saldoInicial: number;
  linhas: ExtratoLinha[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  periodoId: number | undefined;
  fonteId: number | null;
  fonteNome: string;
};

function formatDateBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function getApiBase(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env");
  return v.replace(/\/$/, "");
}

async function fetchExtrato(params: {
  periodoId: number;
  fonteId: number;
  token: string;
}): Promise<ExtratoResponse> {
  const apiBase = getApiBase();
  const url =
    `${apiBase}/api/private/restrita/saldo/extrato` +
    `?periodoId=${params.periodoId}&fonteId=${params.fonteId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${params.token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Falha ao buscar extrato");
  }

  return (await res.json()) as ExtratoResponse;
}

export default function ExtratoFonteModal({
  open,
  onOpenChange,
  periodoId,
  fonteId,
  fonteNome,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtratoResponse | null>(null);

  const canLoad = useMemo(() => {
    return open && !!periodoId && !!fonteId && fonteId > 0;
  }, [open, periodoId, fonteId]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError(null);
      setData(null);
      return;
    }

    if (!canLoad) {
      setLoading(false);
      setData(null);
      setError(!periodoId ? "Período não definido." : !fonteId ? "Fonte inválida." : null);
      return;
    }

    const token = getTokenFromCookie();
    if (!token) {
      setLoading(false);
      setData(null);
      setError("Token não encontrado. Faça login novamente.");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);

        const result = await fetchExtrato({
          periodoId: periodoId!,
          fonteId: fonteId!,
          token,
        });

        if (!cancelled) setData(result);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erro ao buscar extrato";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, canLoad, periodoId, fonteId]);

  if (!open) return null;

  const close = () => onOpenChange(false);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={close} />

      {/* Caixa do modal: ocupa até 90% da altura (90vh), responsivo */}
      <div
        className="
          absolute left-1/2 top-4 -translate-x-1/2
          w-[min(980px,92vw)]
          max-h-[90vh]
          rounded-2xl bg-white shadow-xl border border-slate-200
          flex flex-col
          overflow-hidden
        "
        role="dialog"
        aria-modal="true"
      >
        {/* Header fixo */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <div className="text-lg font-bold text-sky-950 truncate">
              Extrato da fonte: {fonteNome}
            </div>
            <div className="text-xs text-slate-500">Período: {periodoId ?? "-"}</div>
          </div>

          <Button variant="ghost" onClick={close} aria-label="Fechar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Corpo rolável (aqui fica a rolagem) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {loading ? (
            <div className="text-slate-600">Carregando extrato...</div>
          ) : error ? (
            <div className="text-red-700 whitespace-pre-wrap">{error}</div>
          ) : data ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Saldo inicial</div>
                <div className="text-xl font-bold text-sky-950">
                  {DoubleToRealBR(data.saldoInicial)}
                </div>
              </div>

              {/* Scroll horizontal só se precisar; vertical fica no corpo do modal */}
              <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
                <Table className="min-w-[760px]">
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="text-center w-[120px]">Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-center w-[140px]">Entrada</TableHead>
                      <TableHead className="text-center w-[140px]">Saída</TableHead>
                      <TableHead className="text-center w-[160px]">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.linhas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                          Nenhum lançamento para esta fonte no período.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.linhas.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-center whitespace-nowrap">
                            {formatDateBR(l.data)}
                          </TableCell>
                          <TableCell className="break-words">{l.descricao || "-"}</TableCell>
                          <TableCell className="text-center text-green-700 font-semibold whitespace-nowrap">
                            {l.entrada ? DoubleToRealBR(l.entrada) : ""}
                          </TableCell>
                          <TableCell className="text-center text-red-700 font-semibold whitespace-nowrap">
                            {l.saida ? DoubleToRealBR(l.saida) : ""}
                          </TableCell>
                          <TableCell className="text-center font-semibold whitespace-nowrap">
                            {DoubleToRealBR(l.saldo)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="text-xs text-slate-500">
                Entradas em verde, saídas em vermelho, saldo acumulado na última coluna.
              </div>
            </div>
          ) : (
            <div className="text-slate-600">Selecione uma fonte para ver o extrato.</div>
          )}
        </div>

        {/* Footer fixo */}
        <div className="px-4 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <Button variant="outline" onClick={close}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
