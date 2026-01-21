// src/app/(app)/cadastros/fonte/_components/tabelaFontes.tsx

"use client";

import { useState } from "react";
import { useQuery } from "react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import queryClient from "@/lib/reactQuery";
import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm";
import ConfirmationBox from "@/app/(app)/_components/confirmationBox";
import EditaFonteForm from "./editaFonte";

import { excluirFonte, listarFontes } from "@/app/(app)/actions/fonteAPI";
import type { tyFonte } from "@/types/types";
import { tipoFonte } from "@/types/types";

function retTipo(tipo: tipoFonte | string | undefined): string {
  if (tipo === "M") return "Movimentação";
  if (tipo === "C") return "Crédito";
  if (tipo === "A") return "Aplicação";
  return "";
}

export default function TabelaFontes() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [indice, setIndice] = useState<number>(0);
  const [item, setItem] = useState<tyFonte | undefined>(undefined);
  const [isEdita, setIsEdita] = useState(false);

  const {
    data: fontes = [],
    isLoading,
    isError,
    error,
  } = useQuery<tyFonte[], Error>("fontes", listarFontes, {
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
        Erro ao carregar fontes: {error.message}
      </div>
    );
  }

  const handleConfirm = async () => {
    await excluirFonte(indice);
    queryClient.invalidateQueries("fontes");
    setShowConfirmation(false);
  };

  const handleCancel = () => setShowConfirmation(false);

  const handleDeleteFonte = (id: number) => {
    setIndice(id);
    setShowConfirmation(true);
  };

  const handleEditFonte = (id: number, fonte: tyFonte) => {
    setIndice(id);
    setItem(fonte);
    setIsEdita(true);
  };

  return (
    <div className="p-1 w-full">
      {showConfirmation && (
        <ConfirmationBox
          title="Confirmação!"
          menssage="Essa ação vai excluir a fonte de origem das transações. Tem certeza de que deseja continuar?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className="overflow-x-auto mt-4 mb-10">
        {isEdita && (
          <EditaFonteForm
            pIndice={indice}
            pItem={item}
            isEdita={isEdita}
            setIsEdita={setIsEdita}
          />
        )}

        <Card className="w-full">
          <CardContent className="p-0">
            <Table className="min-w-[1000px] rounded-2xl border-sky-800 border-2 shadow p-8">
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                    Fonte
                  </TableHead>
                  <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                    Descrição
                  </TableHead>
                  <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                    Tipo
                  </TableHead>
                  <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                    Ativo
                  </TableHead>
                  <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {fontes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="border-2 border-sky-900 text-center text-slate-500 text-lg"
                    >
                      Nenhuma fonte encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  fontes.map((f) => (
                    <TableRow
                      key={String(f.id ?? "")}
                      className={`hover:bg-slate-200 bold ${
                        f.ativo ? "text-sky-800" : "text-red-900 bg-red-100"
                      }`}
                    >
                      <TableCell className="border-2 border-sky-900 text-center w-[15%] text-lg">
                        {f.nome}
                      </TableCell>
                      <TableCell className="border-2 border-sky-900 text-center w-[55%] text-lg">
                        {f.descricao}
                      </TableCell>
                      <TableCell className="border-2 border-sky-900 text-center w-[15%] text-lg">
                        {retTipo(f.tipo)}
                      </TableCell>
                      <TableCell className="border-2 border-sky-900 text-center w-[5%] text-lg">
                        {f.ativo ? "Sim" : "Não"}
                      </TableCell>
                      <TableCell className="border-2 border-sky-900 text-center w-[10%]">
                        <div className="flex gap-1 justify-center text-sky-800">
                          <Button
                            onClick={() => handleEditFonte(Number(f.id ?? 0), f)}
                            className="h-8 w-8"
                            size="icon"
                            variant="ghost"
                          >
                            <FileEditIcon className="h-6 w-6" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          <Button
                            onClick={() => handleDeleteFonte(Number(f.id ?? 0))}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
