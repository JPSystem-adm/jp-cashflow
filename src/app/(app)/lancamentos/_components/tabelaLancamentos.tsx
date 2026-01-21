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

import { useLancamentoContext } from "./contextLancamentoProvider";
import { useGlobalContext } from "@/app/(app)/contextGlobal";

import type { tyLancamento } from "@/types/types";
import { DoubleToRealBR } from "@/lib/formatacoes";

import { useMemo, useState } from "react";
import queryClient from "@/lib/reactQuery";

import ConfirmationBox from "@/app/(app)/_components/confirmationBox";
import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm";
import EditaLancamentoForm from "./editaLancamento";
import NovoLancamentosForm from "./LancamentosForm";
import ExportaTabela from "./exportarTabela";

import type { OperacaoLancamento } from "@/app/(app)/actions/lancamentoAPI";
import { excluirLancamento } from "@/app/(app)/actions/lancamentoAPI";
import { Plus } from "lucide-react";


type LancamentoCardProps = {
  item: tyLancamento;
  onEdit: (id: number, item: tyLancamento) => void;
  onDelete: (id: number) => void;
};

function normalizeOperacao(op: unknown): OperacaoLancamento {
  // D/C/M antigos viram "M" no front
  return op === "T" ? "T" : "M";
}

function formatDateOnlyBR(value: string): string {
  // espera "YYYY-MM-DD"
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return "";

  const day = m[3];
  const month = m[2];
  return `${day}/${month}`; // dd/MM
}


function LancamentoCard({ item, onEdit, onDelete }: LancamentoCardProps) {
  const id = item.lancamentoId || 0;

  return (
    <div className="rounded-2xl border-2 border-sky-800 shadow-sm bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sky-900 font-semibold text-base truncate">
            {item.grupo} <span className="text-sky-700">/</span>{" "}
            {item.subGrupo}
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
  };

  // seleção e edição
  const [indice, setIndice] = useState(0);
  const [pItem, setPItem] = useState<tyLancamento>();
  const [isEdita, setIsEdita] = useState(false);

  const [openNovo, setOpenNovo] = useState(false);


  const handleConfirm = async () => {
    await excluirLancamento(indice);

    // mantém seu padrão de refetch por filtros
    queryClient.refetchQueries(["lancamentos", periodoId, grupoId, subGrupoId, fonteId]);

    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleDeleteLancamentos = (id: number) => {
    setIndice(id);
    setShowConfirmation(true);
  };

  const handleEditLancamento = (id: number, item: tyLancamento) => {
    setFormGrupoId(item.grupoId || 0);
    setFormSubGrupoId(item.subGrupoId || 0);
    setFormFonteIdO(item.fonteId || 0);
    setFormFonteIdD(item.fonteIdD ?? null);

    // ✅ corrigido: tipo OperacaoLancamento
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

      {/* Top actions responsivas */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between mt-4">
        <div className="flex justify-start">
          <ExportaTabela />
        </div>
        <div className="flex justify-start sm:justify-end gap-2">
          {/* <Button
            type="button"
            className="bg-sky-800 text-white hover:bg-sky-900"
            onClick={() => setOpenNovo(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Lançamento
          </Button> */}

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

      {/* ✅ DESKTOP: tabela */}
      <div className="hidden sm:block w-full overflow-x-auto mt-4 mb-6">
        <Table className="min-w-[1200px] rounded-2xl p-2 border-sky-800 border-2 shadow">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center border-2 w-[10%] text-sky-50 border-sky-700 bg-sky-900 text-lg">
                Conta
              </TableHead>
              <TableHead className="text-center border-2 w-[15%] text-sky-50 border-sky-700 bg-sky-900 text-lg">
                Sub Conta
              </TableHead>
              <TableHead className="text-center border-2 w-[30%] text-sky-50 border-sky-700 bg-sky-900 text-lg">
                Descrição
              </TableHead>
              <TableHead className="text-center border-2 w-[10%] text-sky-50 border-sky-700 bg-sky-900 text-lg">
                Valor
              </TableHead>
              <TableHead className="text-center border-2 w-[15%] min-w-[200px] text-sky-50 border-sky-700 bg-sky-900 text-lg">
                Fonte
              </TableHead>
              <TableHead className="text-center border-2 w-[10%] text-sky-50 border-sky-700 bg-sky-900 text-lg">
                Data
              </TableHead>
              <TableHead className="text-center border-2 w-[10%] min-w-[110px] text-sky-50 border-sky-700 bg-sky-900 text-lg">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {registrosPaginaAtual.map((item) => (
              <TableRow className="hover:bg-slate-200" key={item.lancamentoId}>
                <TableCell className="text-center border-2 text-sky-800 border-sky-900 text-lg">
                  {item.grupo}
                </TableCell>
                <TableCell className="text-center border-2 text-sky-800 border-sky-900 text-lg">
                  {item.subGrupo}
                </TableCell>
                <TableCell className="text-center border-2 text-sky-800 border-sky-900 text-lg">
                  {item.descricao}
                </TableCell>
                <TableCell className="text-center border-2 text-sky-800 border-sky-900 text-lg">
                  {DoubleToRealBR(item.valor || 0)}
                </TableCell>
                <TableCell className="text-center border-2 whitespace-pre-wrap text-sky-800 border-sky-900 text-lg">
                  {item.fontes}
                </TableCell>
                <TableCell className="text-center border-2 text-sky-800 border-sky-900 text-lg">
                  {item.dtLancamento ? formatDateOnlyBR(item.dtLancamento) : ""}
                </TableCell>

                <TableCell className="text-center border-2 text-sky-800 border-sky-900">
                  <div className="flex justify-center gap-2 px-2">
                    <Button
                      onClick={() => handleEditLancamento(item.lancamentoId || 0, item)}
                      className="h-9 w-9"
                      size="icon"
                      variant="ghost"
                    >
                      <FileEditIcon className="h-6 w-6" />
                      <span className="sr-only">Editar</span>
                    </Button>

                    <Button
                      onClick={() => handleDeleteLancamentos(item.lancamentoId || 0)}
                      className="h-9 w-9"
                      size="icon"
                      variant="ghost"
                    >
                      <TrashIcon className="h-6 w-6 text-red-700" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação responsiva */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2">
        <button
          onClick={() => mudarPagina(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-sky-950 text-white px-4 py-2 rounded disabled:opacity-50 w-full sm:w-auto"
        >
          Anterior
        </button>

        <span className="text-center text-sm sm:text-base">
          Página {currentPage} de {totalPaginas}
        </span>

        <button
          onClick={() => mudarPagina(currentPage + 1)}
          disabled={currentPage === totalPaginas}
          className="bg-sky-950 text-white px-4 py-2 rounded disabled:opacity-50 w-full sm:w-auto"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
