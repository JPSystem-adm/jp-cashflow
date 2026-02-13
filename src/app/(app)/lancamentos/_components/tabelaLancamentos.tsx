// src/app/(app)/lancamentos/_components/tabelaLancamentos.tsx
"use client";

import "react-datepicker/dist/react-datepicker.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { useLancamentoContext } from "./contextLancamentoProvider";
import type { tyLancamento } from "@/types/types";
import { DoubleToRealBR } from "@/lib/formatacoes";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationBox from "@/app/(app)/_components/confirmationBox";
import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm";
import EditaLancamentoForm from "./editaLancamento";
import NovoLancamentosForm from "./LancamentosForm";
import ExportaTabela from "./exportarTabela";
import type { OperacaoLancamento } from "@/app/(app)/actions/lancamentoAPI";
import { excluirLancamento } from "@/app/(app)/actions/lancamentoAPI";

type LancamentoCardProps = {
  item: tyLancamento;
  onEdit: (id: number, item: tyLancamento) => void;
  onDelete: (id: number) => void;
};

function normalizeOperacao(op: unknown): OperacaoLancamento {
  return op === "T" ? "T" : "M";
}

function formatDateOnlyBR(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return "";
  return `${m[3]}/${m[2]}`;
}

function LancamentoCard({ item, onEdit, onDelete }: LancamentoCardProps) {
  const id = item.lancamentoId || 0;

  return (
    <div className="rounded-2xl border-2 border-sky-800 shadow-sm bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sky-900 font-semibold text-base truncate">
            {item.grupo} <span className="text-sky-700">/</span> {item.subGrupo}
          </div>

          <div className="text-sky-800 text-sm mt-1 break-words">
            {item.descricao}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            onClick={() => onEdit(id, item)}
            className="h-9 w-9"
            size="icon"
            variant="ghost"
            aria-label="Editar"
            title="Editar"
          >
            <FileEditIcon className="h-6 w-6" />
          </Button>

          <Button
            onClick={() => onDelete(id)}
            className="h-9 w-9"
            size="icon"
            variant="ghost"
            aria-label="Excluir"
            title="Excluir"
          >
            <TrashIcon className="h-6 w-6 text-red-700" />
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
          <div className="text-slate-600 text-xs">Valor</div>
          <div className="text-sky-900 font-semibold">
            {DoubleToRealBR(item.valor || 0)}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
          <div className="text-slate-600 text-xs">Data</div>
          <div className="text-sky-900 font-semibold">
            {item.dtLancamento ? formatDateOnlyBR(item.dtLancamento) : ""}
          </div>
        </div>

        <div className="col-span-2 rounded-lg bg-slate-50 border border-slate-200 p-2">
          <div className="text-slate-600 text-xs">Fonte(s)</div>
          <div className="text-sky-900 break-words whitespace-pre-wrap">
            {item.fontes}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TabelaLancamentos() {
  const { periodoId } = useGlobalContext();
  const queryClient = useQueryClient();

  const {
    dados,
    setFormGrupoId,
    setFormSubGrupoId,
    setFormFonteIdO,
    setFormFonteIdD,
    setOperacao,
    grupoId,
    subGrupoId,
    fonteId,
  } = useLancamentoContext();

  const [showConfirmation, setShowConfirmation] = useState(false);

  // paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPaginas = useMemo(() => {
    const total = Math.ceil(dados.length / pageSize);
    return total === 0 ? 1 : total;
  }, [dados.length]);

  const registrosPaginaAtual = useMemo(() => {
    const indexUltimoRegistro = currentPage * pageSize;
    const indexPrimeiroRegistro = indexUltimoRegistro - pageSize;
    return dados.slice(indexPrimeiroRegistro, indexUltimoRegistro);
  }, [dados, currentPage]);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 1) return;
    if (novaPagina > totalPaginas) return;
    setCurrentPage(novaPagina);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // seleção e edição
  const [indice, setIndice] = useState(0);
  const [pItem, setPItem] = useState<tyLancamento>();
  const [isEdita, setIsEdita] = useState(false);

  const [openNovo, setOpenNovo] = useState(false);

  const handleConfirm = async () => {
    await excluirLancamento(indice);

    queryClient.refetchQueries({
      queryKey: ["lancamentos", periodoId, grupoId, subGrupoId, fonteId],
    });

    setShowConfirmation(false);
  };

  const handleCancel = () => setShowConfirmation(false);

  const handleDeleteLancamentos = (id: number) => {
    setIndice(id);
    setShowConfirmation(true);
  };

  const handleEditLancamento = (id: number, item: tyLancamento) => {
    setFormGrupoId(item.grupoId || 0);
    setFormSubGrupoId(item.subGrupoId || 0);
    setFormFonteIdO(item.fonteId || 0);
    setFormFonteIdD(item.fonteIdD ?? null);
    setOperacao(normalizeOperacao(item.operacao));

    setIndice(id);
    setPItem(item);
    setIsEdita(true);
  };

  return (
    <div className="w-full">
      {showConfirmation && (
        <ConfirmationBox
          title="Confirmação!"
          menssage="Essa ação vai excluir o lançamento. Tem certeza de que deseja continuar?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {isEdita && (
        <EditaLancamentoForm
          pIndice={indice}
          pItem={pItem}
          isEdita={isEdita}
          setIsEdita={setIsEdita}
        />
      )}

      {/* ✅ Top actions: centralizado e ocupando largura */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex justify-start">
          <ExportaTabela />
        </div>
        <div className="flex justify-start sm:justify-end gap-2">
          <NovoLancamentosForm open={openNovo} onOpenChange={setOpenNovo} />
        </div>
      </div>

      {/* ✅ MOBILE: cards */}
      <div className="sm:hidden mt-4 space-y-3">
        {registrosPaginaAtual.map((item) => (
          <LancamentoCard
            key={item.lancamentoId}
            item={item}
            onEdit={handleEditLancamento}
            onDelete={handleDeleteLancamentos}
          />
        ))}
      </div>

      {/* ✅ DESKTOP: tabela (mais larga, fonte menor, sem “folga” inútil) */}
      <div className="hidden sm:block mt-4">
        <div className="w-full overflow-x-auto rounded-2xl border-2 border-sky-800 shadow">
          <Table className="w-full min-w-[1100px] text-sm lg:text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center border-2 border-sky-700 bg-sky-900 text-sky-50 font-semibold text-sm lg:text-xs w-[10%]">
                  Conta
                </TableHead>
                <TableHead className="text-center border-2 border-sky-700 bg-sky-900 text-sky-50 font-semibold text-sm lg:text-xs w-[14%]">
                  Sub Conta
                </TableHead>
                <TableHead className="text-center border-2 border-sky-700 bg-sky-900 text-sky-50 font-semibold text-sm lg:text-xs w-[28%]">
                  Descrição
                </TableHead>
                <TableHead className="text-center border-2 border-sky-700 bg-sky-900 text-sky-50 font-semibold text-sm lg:text-xs w-[10%]">
                  Valor
                </TableHead>
                <TableHead className="text-center border-2 border-sky-700 bg-sky-900 text-sky-50 font-semibold text-sm lg:text-xs min-w-[180px] w-[18%]">
                  Fonte
                </TableHead>
                <TableHead className="text-center border-2 border-sky-700 bg-sky-900 text-sky-50 font-semibold text-sm lg:text-xs w-[8%]">
                  Data
                </TableHead>
                <TableHead className="text-center border-2 border-sky-700 bg-sky-900 text-sky-50 font-semibold text-sm lg:text-xs min-w-[120px] w-[12%]">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {registrosPaginaAtual.map((item) => (
                <TableRow className="hover:bg-slate-100" key={item.lancamentoId}>
                  <TableCell className="text-center border-2 border-sky-900 text-sky-800 whitespace-nowrap py-2">
                    {item.grupo}
                  </TableCell>
                  <TableCell className="text-center border-2 border-sky-900 text-sky-800 whitespace-nowrap py-2">
                    {item.subGrupo}
                  </TableCell>
                  <TableCell className="border-2 border-sky-900 text-sky-800 py-2">
                    <div className="line-clamp-2 break-words text-center">
                      {item.descricao}
                    </div>
                  </TableCell>
                  <TableCell className="text-center border-2 border-sky-900 text-sky-800 whitespace-nowrap py-2">
                    {DoubleToRealBR(item.valor || 0)}
                  </TableCell>
                  <TableCell className="text-center border-2 border-sky-900 text-sky-800 whitespace-pre-wrap py-2">
                    {item.fontes}
                  </TableCell>
                  <TableCell className="text-center border-2 border-sky-900 text-sky-800 whitespace-nowrap py-2">
                    {item.dtLancamento ? formatDateOnlyBR(item.dtLancamento) : ""}
                  </TableCell>

                  <TableCell className="text-center border-2 border-sky-900 py-1">
                    <div className="flex justify-center gap-1 px-2">
                      <Button
                        onClick={() => handleEditLancamento(item.lancamentoId || 0, item)}
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                      >
                        <FileEditIcon className="h-5 w-5" />
                        <span className="sr-only">Editar</span>
                      </Button>

                      <Button
                        onClick={() => handleDeleteLancamentos(item.lancamentoId || 0)}
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                      >
                        <TrashIcon className="h-5 w-5 text-red-700" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ✅ Paginação: centralizada + com “respiro” inferior real */}
      <div className="mt-6 mb-10 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => mudarPagina(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 px-3"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <span className="min-w-[90px] text-center text-sm font-semibold text-slate-700">
          {currentPage}/{totalPaginas}
        </span>

        <Button
          type="button"
          variant="outline"
          onClick={() => mudarPagina(currentPage + 1)}
          disabled={currentPage === totalPaginas}
          className="h-9 px-3"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
