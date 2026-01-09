// src/app/(app)/cadastros/grupoDeContas/_components/tabelaGrupos.tsx
"use client";

import { useState } from "react";
import { useQuery } from "react-query";

import { Button } from "@/components/ui/button";
import {
  TableHead,
  TableRow,
  TableHeader,
  TableCell,
  TableBody,
  Table,
} from "@/components/ui/table";

import queryClient from "@/lib/reactQuery";
import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm";
import ConfirmationBox from "@/app/(app)/_components/confirmationBox";
import EditaGrupoForm from "./editaGrupo";

import {
  listarGrupos,
  excluirGrupo,
  buscarGrupo,
} from "@/app/(app)/actions/grupoAPI";

import type { tyGrupo, tyGrupoLista } from "@/types/types";
import { tipoGrupo } from "@/types/types";

export default function TabelaGrupos() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [indice, setIndice] = useState(0);
  const [item, setItem] = useState<tyGrupo | undefined>(undefined);
  const [isEdita, setIsEdita] = useState(false);

  const {
    data: grupos = [],
    isLoading,
    isError,
    error,
  } = useQuery<tyGrupoLista[], Error>("grupos", listarGrupos, {
    initialData: [],
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });

  if (isLoading) {
    return (
      <div className="loading">
        <h1>Carregando...</h1>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-700 text-center">
        Erro ao carregar grupos: {error.message}
      </div>
    );
  }

  const handleConfirm = async () => {
    await excluirGrupo(indice);
    queryClient.invalidateQueries("grupos");
    setShowConfirmation(false);
  };

  const handleCancel = () => setShowConfirmation(false);

  const handleDeleteGrupo = (id: number) => {
    setIndice(id);
    setShowConfirmation(true);
  };

  const handleEditGrupo = async (id: number) => {
    setIndice(id);
    const grupoCompleto = await buscarGrupo(id);
    setItem(grupoCompleto);
    setIsEdita(true);
  };

  return (
    <div className="p-1">
      {showConfirmation && (
        <ConfirmationBox
          title="Confirmação!"
          menssage="Essa ação vai excluir o grupo e todos os subgrupos associados. Tem certeza de que deseja continuar?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className="overflow-x-auto mt-4 mb-10">
        {isEdita && (
          <EditaGrupoForm
            pIndice={indice}
            pItem={item}
            isEdita={isEdita}
            setIsEdita={setIsEdita}
          />
        )}

        <Table className="min-w-[1000px] rounded-2xl border-sky-800 border-2 shadow p-8">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Conta
              </TableHead>
              <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Descrição
              </TableHead>
              <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Tipo
              </TableHead>
              <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Subcontas
              </TableHead>
              <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {grupos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="border-2 border-sky-900 text-center text-slate-500 text-lg"
                >
                  Nenhum grupo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              grupos.map((g) => (
                <TableRow
                  key={String(g.id)}
                  className={`hover:bg-slate-200 bold ${
                    g.ativo ? "text-sky-800" : "text-red-900 bg-red-100"
                  }`}
                >
                  <TableCell className="border-2 border-sky-900 text-center w-[13%] text-lg">
                    {g.nome}
                  </TableCell>
                  <TableCell className="border-2 border-sky-900 text-center w-[64%] text-lg">
                    {g.descricao}
                  </TableCell>
                  <TableCell className="border-2 border-sky-900 text-center w-[64%] text-lg">
                    {g.tipoDesc}
                  </TableCell>
                  <TableCell className="border-2 border-sky-900 text-center w-[1%] text-lg">
                    {g.qtdSubGrupos}
                  </TableCell>
                  <TableCell className="border-2 border-sky-900 text-center w-[10%]">
                    <div className="flex gap-1 justify-center text-sky-800">
                      <Button
                        onClick={() => handleEditGrupo(Number(g.id))}
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                      >
                        <FileEditIcon className="h-6 w-6" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      <Button
                        disabled={g.tipo !== tipoGrupo.Debito}
                        onClick={() => handleDeleteGrupo(Number(g.id))}
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                      >
                        <TrashIcon className="h-6 w-6 text-red-700" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
