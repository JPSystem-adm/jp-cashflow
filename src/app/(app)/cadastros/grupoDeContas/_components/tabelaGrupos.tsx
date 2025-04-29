"use client"

import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import { useQuery} from 'react-query';
import queryClient from "@/lib/reactQuery";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table, } from "@/components/ui/table";
import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm";
import { DeleteGrupo, RetGrupo, RetGrupos } from "@/app/(app)/actions/grupoActions";
import { tyGrupo, tyGrupoLista, tipoGrupo } from "@/types/types";
import { useState } from "react";
import EditaGrupoForm from "./editaGrupo";
import ConfirmationBox from "@/app/(app)/_components/confirmationBox";

interface Props {
  userIdSession: number | undefined;
}

export default function TabelaGrupos({userIdSession}: Props) {

  //Variavel para a caixa de confirmação (ConfirmationBox)
  const [showConfirmation, setShowConfirmation] = useState(false);
  //Variaveis para setar o indice selecionado
  const [indice, setIndice] = useState(0);
  const [item, setItem]=useState<tyGrupo>();
  
  //Variaveis para ativar o forme (EditaGrupoForm)
  const [isEdita, setIsEdita] = useState(false);

  //Criação e execução do HOOK useQuery
  //Carrega as fontes
  const { data, isLoading } = useQuery( "grupos", async () => { 
    const response:tyGrupoLista[] = await RetGrupos(userIdSession);
    return response;
  })

  //Tratamento para exibição de menssagem de espera
  //enquanto estiver processando a consulta do UseQuery
  if(isLoading){
    return(<div className="loading"><h1>Carregando...</h1></div>)
  }

  //Função para cofirmar a exclusão
  const handleConfirm= async ()=>{
    await DeleteGrupo(indice);
    //Limpar o cache da consulta para atualizar os dados
    queryClient.invalidateQueries("grupos")

    //fecha caixa de confirmação
    setShowConfirmation(false);
  };

  //Função para cancelar a exclusão
  const handleCancel=()=>{
    //fecha caixa de confirmação
    setShowConfirmation(false);
  };

  // Função para excluir um grupo
  const handleDeleteGrupo = async (index: number) => {
    setIndice(index);
    setShowConfirmation(true)
  }


  const handleEditGrupo = async (index: number, item: tyGrupo) => {
    setIndice(index);
    setItem(item)
    setIsEdita(true);
  };

  return (
    // <div className="flex flex-col w-full items-center">
    <div className="p-1">
      { showConfirmation && (
          <ConfirmationBox
            title="Confirmação!"
            menssage="Essa ação vai excluir o grupo e todos os subgrupos associados. Tem certeza de que deseja continuar?"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )
      }
      <div className="overflow-x-auto mt-4 mb-10">
        {isEdita && (
          <EditaGrupoForm
            pIndice={indice}
            pItem={item}
            isEdita={isEdita}
            setIsEdita={setIsEdita}
          />
        )}
        {/* <Table className="border-collapse border-spacing-0"> */}
        <Table className="min-w-[1300px] overflow-auto rounded-2xl p-8 border-sky-800 border-2 shadow">
          <TableHeader>
            <TableRow>
              <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Conta
              </TableHead>
              <TableHead className=" bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Descrição
              </TableHead>
              <TableHead className=" bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
                Tipo
              </TableHead>
              <TableHead className=" bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
                Subcontas
              </TableHead>
              <TableHead className=" bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {data?.map((item: any) => (
            <TableRow className ={`hover:bg-slate-200 bold ${item.ativo ?  "text-sky-800" : "text-red-900 bg-red-100"}`}  key={item.id}>
              <TableCell className="border-2 text-sky-800 border-sky-900 text-center w-[13%] text-lg">{item.nome}</TableCell>
              <TableCell className="border-2 text-sky-800 border-sky-900 w-[64%] text-center text-lg">{item.descricao}</TableCell>
              <TableCell className="border-2 text-sky-800 border-sky-900 w-[64%] text-center text-lg">{item.tipoDesc}</TableCell>
              <TableCell className="border-2 text-sky-800 border-sky-900 w-[1%]  text-center  text-lg">{item?.qtdSubGrupos.toString()}</TableCell>
              <TableCell className="border-2 text-sky-800 border-sky-900 w-[10%]">
                <div className="flex gap-1 justify-center text-sky-800">
                  <Button
                    onClick={() => handleEditGrupo(item.id, item)}
                    className="h-8 w-8"
                    size="icon"
                    variant="ghost"
                  >
                    <FileEditIcon className="h-6 w-6" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    disabled={item.tipo === tipoGrupo.Debito ? false : true}
                    onClick={() => handleDeleteGrupo(item.id)} 
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
      </div>
    </div>
  );
}

