// src/app/(app)/cadastros/saldos/_components/tabelaSaldos.tsx

"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileEditIcon } from "@/app/(app)/_components/iconsForm";
import { DoubleToRealBR } from "@/lib/formatacoes";
import { useSaldoContext } from "./contextSaldosProvider";
import FormSaldo from "./saldosForm";
import { FileText } from "lucide-react";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import ExtratoFonteModal from "./ExtratoFonteModal";

type JsonObject = Record<string, unknown>;

type SaldoRowUI = {
  saldoId: number;
  FonteId: number;
  Fonte: string;
  Tipo: string;
  valorInicial: number;
  valorPeriodo: number;
  saldoAtual: number;
};

function toNumber(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function toString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function normalizeRow(raw: unknown): SaldoRowUI | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as JsonObject;

  const saldoId = toNumber(r.saldoId ?? r.idSaldo ?? r.id, 0);

  const Fonte =
    toString(r.Fonte) ||
    toString(r.fonte) ||
    toString(r.nomeFonte) ||
    toString(r.FonteNome) ||
    "";

  const Tipo =
    toString(r.Tipo) ||
    toString(r.tipo) ||
    toString(r.tipoFonte) ||
    "";

  const valorInicial =
    toNumber(r.valorInicial, NaN) ||
    toNumber(r.saldoInicial, NaN) ||
    toNumber(r.valor, NaN) ||
    0;

  const valorPeriodo = toNumber(
    r.valorPeriodo ?? r.movimentacao ?? r.periodoValor ?? 0,
    0
  );

  const saldoAtualFromApi = toNumber(r.saldoAtual, NaN);
  const saldoAtual = Number.isFinite(saldoAtualFromApi)
    ? saldoAtualFromApi
    : (Number.isFinite(valorInicial) ? (valorInicial - valorPeriodo) : 0);

  if (!Fonte.trim()) return null;

  const FonteId = toNumber(r.FonteId ?? r.fonteId ?? 0, 0);

  return {
    saldoId: Number.isFinite(saldoId) ? Math.trunc(saldoId) : 0,
    Fonte: Fonte.trim(),
    Tipo,
    valorInicial: Number.isFinite(valorInicial) ? valorInicial : 0,
    valorPeriodo,
    saldoAtual: Number.isFinite(saldoAtual) ? saldoAtual : 0,
    FonteId: Number.isFinite(FonteId) ? Math.trunc(FonteId) : 0,
  };
}

export default function TabelaSaldo() {
  const { rows } = useSaldoContext();
  const { periodoId } = useGlobalContext();

  const [isEdita, setIsEdita] = useState(false);
  const [indice, setIndice] = useState(0);

  // extrato modal state
  const [extratoOpen, setExtratoOpen] = useState(false);
  const [extratoFonteId, setExtratoFonteId] = useState<number | null>(null);
  const [extratoFonteNome, setExtratoFonteNome] = useState<string>("");

  const normalizedRows = useMemo(() => {
    const out: SaldoRowUI[] = [];
    for (const item of rows as unknown[]) {
      const n = normalizeRow(item);
      if (n) out.push(n);
    }
    return out;
  }, [rows]);

  const onEdit = (i: number) => {
    setIndice(i);
    setIsEdita(true);
  };

  const onOpenExtrato = (fonteId: number, fonteNome: string) => {
    setExtratoFonteId(fonteId);
    setExtratoFonteNome(fonteNome);
    setExtratoOpen(true);
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="border-collapse border-spacing-0 w-full min-w-[980px]">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Fonte
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Saldo Inicial
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Movimento
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Saldo Atual
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
              Tipo
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
              Extrato
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
              Editar
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {normalizedRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                Nenhum saldo encontrado para este período.
              </TableCell>
            </TableRow>
          ) : (
            normalizedRows.map((item, index) => {
              const movimento = item.valorPeriodo;

              const movimentoClass =
                movimento > 0
                  ? "text-green-700"
                  : movimento < 0
                  ? "text-red-700"
                  : "text-sky-900";

              return (
                <TableRow
                  className="hover:bg-slate-200"
                  key={`${item.FonteId}-${item.saldoId}-${index}`}
                >
                  <TableCell className="border-2 border-sky-900 text-sky-900 text-center text-lg">
                    {item.Fonte}
                  </TableCell>

                  <TableCell className="border-2 border-sky-900 text-sky-900 text-center text-lg">
                    {DoubleToRealBR(item.valorInicial)}
                  </TableCell>

                  <TableCell
                    className={`border-2 border-sky-900 text-center text-lg font-semibold ${movimentoClass}`}
                  >
                    {DoubleToRealBR(movimento)}
                  </TableCell>

                  <TableCell className="border-2 border-sky-900 text-sky-900 text-center text-lg">
                    {DoubleToRealBR(item.saldoAtual)}
                  </TableCell>

                  <TableCell className="border-2 border-sky-900 text-center text-sky-900 text-lg">
                    {item.Tipo}
                  </TableCell>

                  <TableCell className="border-2 border-sky-900">
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => onOpenExtrato(item.FonteId, item.Fonte)}
                        title="Ver extrato"
                        aria-label="Ver extrato"
                      >
                        <FileText className="h-6 w-6 text-sky-800" />
                      </Button>
                    </div>
                  </TableCell>

                  <TableCell className="border-2 border-sky-900">
                    <div className="flex justify-center">
                      <Button variant="ghost" onClick={() => onEdit(index)}>
                        <FileEditIcon className="h-6 w-6 text-sky-800" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {isEdita && (
        <FormSaldo indice={indice} isEdita={isEdita} setIsEdita={setIsEdita} />
      )}

      <ExtratoFonteModal
        open={extratoOpen}
        onOpenChange={setExtratoOpen}
        periodoId={periodoId}
        fonteId={extratoFonteId}
        fonteNome={extratoFonteNome}
      />
    </div>
  );
}
