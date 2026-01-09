// src/app/(app)/cadastros/fonte/_components/tabelaFontes.tsx

"use client";

import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import { useQuery } from "react-query";
import queryClient from "@/lib/reactQuery";
import { TableHead, TableRow, TableHeader, TableCell, TableBody,  Table, } from "@/components/ui/table";
import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm";
import { DeleteFontes, ListaFontes } from "@/app/(app)/actions/fonteActions";
import ConfirmationBox from "@/app/(app)/_components/confirmationBox";
import { useState } from "react";
import EditaFonteForm from "./editaFonte";
import { tyFonte } from "@/types/types";

export default function TabelaFontes() {
  //Variavel para a caixa de confirmação (ConfirmationBox)
  const [showConfirmation, setShowConfirmation] = useState(false);
  //Variaveis para setar o indice selecionado
  const [indice, setIndice] = useState(0);
  const [item, setItem] = useState<tyFonte>();

  //Variaveis para ativar o forme (EditaGrupoForm)
  const [isEdita, setIsEdita] = useState(false);

  //Criação e execução do HOOK useQuery
  //Carrega as fontes
  const { data, isLoading } = useQuery("fontes", async () => {
    const response = await ListaFontes();
    // console.log("DATA", data)
    return response;
  });

  //Tratamento para exibição de menssagem de espera
  //enquanto estiver processando a consulta do UseQuery
  if (isLoading) {
    return (
      <div className="loading">
        <h1>Carregando…</h1>
      </div>
    );
  }

  //Função para cofirmar a exclusão
  const handleConfirm = async () => {
    await DeleteFontes(indice);
    //Limpar o cache da consulta para atualizar os dados
    queryClient.invalidateQueries("fontes");

    //fecha caixa de confirmação
    setShowConfirmation(false);
  };

  //Função para cancelar a exclusão
  const handleCancel = () => {
    //fecha caixa de confirmação
    setShowConfirmation(false);
  };

  // Função para excluir um item da lista
  const handleDeleteFonte = async (index: number) => {
    setIndice(index);
    setShowConfirmation(true);
  };

  const handleEditFonte = async (index: number, item: tyFonte) => {
    setIndice(index);
    setItem(item);
    setIsEdita(true);
  };

  //Função para tazer a descrição do tipo dentro da tabela
  function retTipo(tipo: String) {
    let retorno = "";
    if (tipo === "M") retorno = "Movimentação";
    if (tipo === "C") retorno = "Crédito";
    if (tipo === "A") retorno = "Aplicação";
    return retorno;
  }

  return (
    <div className="flex flex-col w-full items-center">
      {showConfirmation && (
        <ConfirmationBox
          title="Confirmação!"
          menssage="Essa ação vai excluir a fonte de origem das transações. Tem certeza de que deseja continuar?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      <Card className="w-full">
        <CardContent className="p-0">
          {isEdita && (
            <EditaFonteForm
              pIndice={indice}
              pItem={item}
              isEdita={isEdita}
              setIsEdita={setIsEdita}
            />
          )}
          {/* <Table> */}
          <Table className="min-w-[1300px] overflow-auto rounded-2xl p-8 border-sky-800 border-2 shadow">
            <TableHeader>
              <TableRow>
                {/* <TableHead className="w-[100px]">ID</TableHead> */}
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
                <TableHead className="w-[100px] bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((item: any) => (
                <TableRow className="hover:bg-slate-200" key={item.id}>
                  {/* <TableCell>{item.id}</TableCell> */}
                  <TableCell className="border-2 border-sky-900 text-sky-900 text-center w-[15%] text-lg">{item.nome}</TableCell>
                  <TableCell className="border-2 border-sky-900 text-sky-900 w-[55%] text-center text-lg">{item.descricao}</TableCell>
                  <TableCell className="border-2 border-sky-900 text-sky-900 w-[15%] text-center text-lg">{retTipo(item.tipo)}</TableCell>
                  <TableCell className="border-2 border-sky-900 text-sky-900 w-[5%] text-center text-lg">{item.ativo.toString()}</TableCell>
                  <TableCell className="border-2 border-sky-900 w-[10%]">
                    <div className="flex gap-1 justify-center text-sky-800">
                      <Button
                        onClick={() => handleEditFonte(item.id, item)}
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                      >
                        <FileEditIcon className="h-6 w-6" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        onClick={() => handleDeleteFonte(item.id)}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
