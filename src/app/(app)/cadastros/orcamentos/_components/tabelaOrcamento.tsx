// src/app/(app)/cadastros/orcamentos/_components/tabelaOrcamento.tsx
"use client";

import React, { useMemo, useState } from "react";
import { FileEditIcon } from "@/app/(app)/_components/iconsForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { useOrcamentoContext } from "./contextProvider";
import FormOrcamento from "./OrcamentoForm";
import { DoubleToRealBR } from "@/lib/formatacoes";

export default function TabelaOrcamento() {
  const { dados } = useOrcamentoContext();

  const [isEdita, setIsEdita] = useState(false);
  const [indice, setIndice] = useState(0);

  const normalized = useMemo(() => {
    // garante que não quebra se vier undefined/null por alguma razão
    const arr = Array.isArray(dados) ? dados : [];
    return arr.filter((x) => x && typeof x === "object");
  }, [dados]);

  const onEdit = (i: number) => {
    setIndice(i);
    setIsEdita(true);
  };

  return (
    <div className="w-full overflow-x-auto">
      <Table className="border-collapse border-spacing-0 w-full min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Grupo
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Valor
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
              Tipo
            </TableHead>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
              Editar
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {normalized.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                Nenhum orçamento encontrado para este período.
              </TableCell>
            </TableRow>
          ) : (
            normalized.map((item, index) => (
              <TableRow className="hover:bg-slate-200" key={`${item.orcamentoId}-${index}`}>
                <TableCell className="border-2 border-sky-900 text-sky-900 text-center text-lg whitespace-nowrap">
                  {item.nomeGrupo}
                </TableCell>

                <TableCell className="border-2 border-sky-900 text-sky-900 text-center text-lg whitespace-nowrap">
                  {DoubleToRealBR(item.valor ?? 0)}
                </TableCell>

                <TableCell className="border-2 border-sky-900 text-center text-sky-900 text-lg whitespace-nowrap">
                  {item.tipoGrupo}
                </TableCell>

                <TableCell className="border-2 border-sky-900">
                  <div className="flex justify-center">
                    <Button variant="ghost" onClick={() => onEdit(index)} aria-label="Editar orçamento">
                      <FileEditIcon className="h-6 w-6 text-sky-800" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {isEdita && (
        <FormOrcamento indice={indice} isEdita={isEdita} setIsEdita={setIsEdita} />
      )}
    </div>
  );
}
