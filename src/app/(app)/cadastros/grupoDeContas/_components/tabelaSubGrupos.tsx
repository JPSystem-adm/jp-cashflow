// src/app/(app)/cadastros/grupoDeContas/_components/tabelaSubGrupos.tsx
"use client"
// COMPONENTE PAI
import { Button } from "@/components/ui/button"
import { CardContent, Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm"
import NovoSubGrupo from "./novoSubGrupo"
import EditaSubGrupo from "./editaSubGrupo"
import { tyResult, tySubGrupo } from "@/types/types"
import { Table, TableCaption, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { useQuery } from "react-query";
import { AlteraSubGrupo, CreateSubGrupo, DeleteSubGrupo, RetSubGrupos } from "@/app/(app)/actions/grupoActions"
import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox"
import queryClient from "@/lib/reactQuery";


interface Props {
  origem: string;
  grupoId: number;
  dados: tySubGrupo[];
  setSubGruposP: React.Dispatch<React.SetStateAction<tySubGrupo[]>>;
}

export default function TabelaSubGrupos({origem, grupoId, dados, setSubGruposP }: Props) {

  //Lista dos subGrupos
  const [subGrupos, setSubGrupos] = useState<tySubGrupo[]>(dados)
 //const [alterou, setAlterou] = useState(false)
  const [isEdita, setIsEdita] = useState(false)
  const [indexSG, setIndexSG] = useState(0)

  //Variaveis para a caixa de avisos (WarningBox)
  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Menssagem default");

  //Função para fechar o formulário de edição dos dados
  const handleFechar=()=>{
    //setSubGruposP([]);
    setIsEdita(false);
    setShowAlerta(false);
  };

  //Criação e execução do HOOK useQuery
  //Carrega o grupo e seus subgrupos  
  const { data, isLoading } = useQuery("subgrupos", async () => {
    const retSubGrupos = await RetSubGrupos(grupoId);
    setSubGrupos(retSubGrupos)
    return retSubGrupos;
  });
  // Tratamento para exibição de menssagem de espera
  // enquanto estiver processando a consulta do UseQuery
  if(isLoading){
    return(<div className="loading"><h1>Carregando...</h1></div>)
  }


  //Função para incluir um subGrupo na lista
  const handleAddSubGrupo = async (item: tySubGrupo) => {

    //Uma validação para ver se o Nome do subgrupo já existe
    const index = subGrupos.findIndex((subGrupo) => subGrupo.nome === item.nome)

    let retorno:tyResult = {status: "", menssagem: "", dados: {}};

    //Não tem duplicidade de Nome
    if (index === -1) {

      //Origem Edicao do Grupo
      if(origem==="Edicao"){

        try{
          item.grupoId = grupoId;
          retorno = await CreateSubGrupo(item) 
          if(retorno.status === "Sucesso"){
            const lista: tySubGrupo[] = [...subGrupos, item]
            setSubGrupos(lista)
            ordenarSubGrupos(lista) 
          } 
        }
        catch(error){
          retorno.status = "Erro"
          retorno.menssagem = "Erro na execução da consulta" 
          return retorno
        }

      }
      //Origem Novo Grupo
      else
      {
        const lista: tySubGrupo[] = [...subGrupos, item]
        setSubGrupos(lista)
        ordenarSubGrupos(lista) 
        retorno.status = "Sucesso"
        retorno.menssagem = "Incluido novo subGrupo!"
      }

      queryClient.invalidateQueries("grupos")
      return retorno

    }
    //Duplicidade de Nome
    else{
        retorno.status = "Erro"
        retorno.menssagem = "Nome de subGrupo duplicado verifique!"
    }
    return retorno
  }

  // Função para excluir um item da lista
  const handleDeleteSubGrupo = async (index: number) => {
    let retorno:tyResult = {status: "", menssagem: "", dados: {}};
    console.log("AQUI: index: ", index);

    //Tratamento quando vem da Edição do Grupo
    if(origem==="Edicao"){
      const subGrupoId = subGrupos[index].id || 0;
      //Apagar no Banco
      try{

        retorno = await DeleteSubGrupo(subGrupoId) 
        if(retorno.status === "Sucesso"){

          const newArray = [
            ...subGrupos.slice(0, index),
            ...subGrupos.slice(index + 1),
          ]
          setSubGrupos(newArray)
          setSubGruposP(newArray)
        } 
      }
      catch(error){
        retorno.status = "Erro"
        retorno.menssagem = "Erro na execução da consulta" 
        return retorno
      }
    }
    //Tratamento quando vem de um Novo Grupo
    else{
      const newArray = [
        ...subGrupos.slice(0, index),
        ...subGrupos.slice(index + 1),
      ]
      setSubGrupos(newArray)
      setSubGruposP(newArray)
    }
    queryClient.invalidateQueries("subgrupos")
    queryClient.invalidateQueries("grupos") 
    //setIsEdita(true)

  }

  //Função para exibir o formulario de edição do subGrupo
  const handleEditSubGrupo = async (nome?: string) => {
    // Encontra o índice do objeto com o id fornecido
    const index = subGrupos.findIndex(item => item.nome === nome);
    setIndexSG(index)
    setIsEdita(true)
  //   //console.log("Index-G: ", index)
  }

  const EditSubGrupo = async (nome: string, novosDados: { descricao?: string; ativo?: boolean }) => {
    setSubGrupos(prevSubtipo =>
      prevSubtipo.map(elemento =>
        elemento.nome === nome ? { ...elemento, ...novosDados } : elemento
      )
    );
    setSubGruposP(subGrupos)
    return true;
  };

  //Função para ordenar a lista
  async function ordenarSubGrupos(itens: tySubGrupo[]) {
    console.log("Ordenou")
    const listOrdenada = itens.sort((a, b) => {
      if (a.nome < b.nome) {
        return -1
      }
      if (a.nome > b.nome) {
        return 1
      }
      return 0
    })
    setSubGrupos(listOrdenada)
    setSubGruposP(listOrdenada)
  }

  return (
    <>
    { showAlerta && (
        <WarningBox
          tipo={tipo}
          mensagem={mensagem}
          onCancel={handleFechar}
        />
      )
    } 
    <div className="flex flex-col w-full items-center">
      <Card className="w-full">
        <CardContent className="p-0">
          <Table>
            <TableCaption className="caption-top">
              <div className="flex flex-row justify-around w-full gap-4">
                <div className="flex  font-bold space-y-2">
                  <span className="flex text-2xl ">Lista de SubGrupos</span>
                </div>
               {/* ================================ */}
                <div className="flex justify-end">
                  <NovoSubGrupo
                    //data={subGrupos}
                    onAddItem={handleAddSubGrupo}
                  />
                </div>
                {/* ================================ */}
              </div>
            </TableCaption>
            <TableHeader>
              <TableRow>
                {/* <TableHead className="w-[100px]">Indice</TableHead> */}
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Excluir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subGrupos.map((grupo, index) => (
                <TableRow key={index} className={grupo.ativo ? 'text-black' : 'text-red-500'} >
                  {/* <TableCell className="font-medium">{index}</TableCell> */}
                  <TableCell className="text-sky-900">{grupo.nome}</TableCell>
                  <TableCell className="text-sky-900">{grupo.descricao}</TableCell>
                  <TableCell className="text-sky-900">{grupo.ativo ? 'True' : 'False'}</TableCell>
                  <TableCell className="text-sky-900">
                    <Button
                      onClick={() => handleEditSubGrupo(grupo.nome)} 
                      className="h-8 w-8" 
                      size="icon" 
                      variant="ghost"
                    >
                      <FileEditIcon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      onClick={() => handleDeleteSubGrupo(index)}
                      className="h-8 w-8"
                      size="icon"
                      variant="ghost"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* === Formulario para edição do subGrupo === */}
        {
          isEdita && (
            <EditaSubGrupo
              onEditItem={EditSubGrupo} 
              data={subGrupos[indexSG]}
              isEdita={isEdita}
              setIsEdita={setIsEdita}
            />
          )
        }
      {/* =========================================== */}
    </div>
    </>
  )
}
