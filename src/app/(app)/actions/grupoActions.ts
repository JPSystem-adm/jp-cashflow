"use server"

import { tyErro, tyResult, tySubGrupo, tyGrupo, tyGrupoLista } from "@/types/types"
import prisma from "@/lib/db"
import {Grupo, SubGrupo } from "@prisma/client"


//Função para retornar todos os subGrupos
//conforme id do grupo especificado
export async function RetSubGrupos(GrupoID: number | undefined){
  const dados: tySubGrupo[]=[];
  try {
    const subgrupos = await prisma.subGrupo.findMany({
      where: { grupoId: GrupoID},
    })
    if(subgrupos.length > 0){
      subgrupos.map(item => {
        dados.push({ 
          id: item.id,
          nome: item.nome,
          descricao: item.descricao || undefined,
          ativo: item.ativo,
          grupoId: item.grupoId,
        })
      })
    }
  }catch(err) {
    console.error('Ocorreu um erro na leitura dos dados! ', err)
  }
  return dados;
}

//Está função faz uma consulta no banco de dados
//e retornar todos os grupos com a quantidade de subGrupos associado
export async function RetGrupos(userID: number | undefined) {
  let grupos: tyGrupoLista[]
  try {
    grupos = await prisma.$queryRaw`
      Select 
        Grupo.id as id,
        Grupo.nome as nome,
        Grupo.descricao as descricao,
        Grupo.tipo as tipo,
        CASE Grupo.tipo
		      WHEN 'D' THEN 'Débito'
          WHEN 'C' THEN 'Crédito'
          ELSE 'Movimento'
	      END as tipoDesc,
        Grupo.ativo as ativo,
        Count(SubGrupo.id) as qtdSubGrupos, 
        Grupo.userId as userId
          
      From  Grupo Left Join SubGrupo  On Grupo.id = SubGrupo.grupoId 
      Where
        Grupo.userID = ${userID}
      Group By 
        Grupo.id,
        Grupo.nome, 
        Grupo.descricao,
        Grupo.tipo,
        Grupo.ativo,
        Grupo.userId
      Order By
	      Grupo.tipo,
        Grupo.nome 
    `
    return grupos
  } catch (err: any) {
    return (grupos = [{}])
  }
}

//Essa função retorna os dados do Grupo para Edição
export async function RetGrupo(grupoId: number): Promise<{ grupo?: Grupo | null; 
                                subGrupos: SubGrupo[] }> {
  try {
    const grupo = await prisma.grupo.findUnique({ 
      where: { id: grupoId },
      include:{subGrupos: true},
    });
    return { grupo , subGrupos: grupo?.subGrupos || [] };
  } catch (error){
    console.error('Error fetching grupo:', error)
    return { grupo: undefined, subGrupos: [] };
  }
  
}

//Essa função altera os dados do Grupo
export async function AlteraGrupo(data: tyGrupo){
  let result:tyResult = <tyResult>{};
  try {
    const grupo = await prisma.grupo.update({
      where: {id: data.id},
      data: {
        nome: data.nome.toUpperCase(),
        descricao: data.descricao,
        tipo: data.tipo,
        ativo: data.ativo,
      },
    })
    result.status = "Sucesso"
    result.dados = grupo
    return result    
  } catch (err) {
    const erro = <tyErro>err;
    result.status = "Erro"
    result.menssagem = erro.code
    return result
  }
}

//Função para excluir um registro da tabela grupos e dos subgrupos associados
export async function DeleteGrupo(index: number) {
  await prisma.$transaction(async (trx) => {
    try {      
      const subGrupos = await prisma.subGrupo.deleteMany({
        where: { grupoId: index },
      })
      const grupo = await prisma.grupo.delete({
        where: { id: index },
      });
      return Promise.resolve(grupo);
    } catch (error) {
      return Promise.resolve(error);
    }
  })
}

//Essa função inclui um novoGrupo e todos os subgrupos associados
export async function NovoGrupoComSubgrupos(
  dadosGrupo: tyGrupo,
  dadosSubGrupos: tySubGrupo[]
) {
  let result:tyResult = <tyResult>{};
  try {    
    const grupo = await prisma.grupo.create({
      data: {
        nome: dadosGrupo.nome.toUpperCase(),
        descricao: dadosGrupo.descricao,
        tipo: dadosGrupo.tipo,
        ativo: dadosGrupo.ativo,
        userId: dadosGrupo.userId,
        subGrupos: {
          create: dadosSubGrupos.map((subGrupo) => ({
            nome: subGrupo.nome.toUpperCase(),
            descricao: subGrupo.descricao,
          })),
        },
      },
      include: {
        subGrupos: true,
      },
    })
    result.status = "Sucesso"
    result.dados = grupo
    return result
    
  } catch (error ) {

      const erro = <tyErro>error;
      result.status = "Erro"
      result.menssagem = erro.code
      return result
  }
}

//Essa função altera um Grupo que já existe e todos os subgrupos associados
export async function AlterarGrupoComSubgrupos(
  dadosGrupo: tyGrupo,
  dadosSubGrupos: tySubGrupo[]
) {
  await prisma.$transaction(async (trx) => {
    //Altera os dados do grupo
    await AlteraGrupo(dadosGrupo)
    //Laço para verificar os subgrupos
    if(dadosSubGrupos.length > 0){
      dadosSubGrupos.map(async (subGrupo) => {
        if(subGrupo.acao = "A"){
          await AlteraSubGrupo(subGrupo)
        }
        if(subGrupo.acao = "C"){
          await CreateSubGrupo(subGrupo)
        }
        if(subGrupo.acao = "D"){
          await DeleteSubGrupo(subGrupo.id || 0)
        }
      });
    }
  })

}


//Essa função altera os dados do subGrupo
export async function AlteraSubGrupo(data: tySubGrupo) {
  let result:tyResult = <tyResult>{};
  try {
    const subGrupo = await prisma.subGrupo.update({
      where: {id: data.id},
      data: {
        nome: data.nome,
        descricao: data.descricao,
        ativo: data.ativo,
      },
    })
    result.status = "Sucesso"
    result.dados = subGrupo
    return result     
  } catch (err) {
    const erro = <tyErro>err;
    result.status = "Erro"
    result.menssagem = erro.code
    return result
  }
}

//Essa função inclui um novo subGrupo
export async function CreateSubGrupo(data: tySubGrupo) {
  let result:tyResult = <tyResult>{};
  try {
    const subGrupo = await prisma.subGrupo.create({
      data: {
        nome: data.nome.toUpperCase(),
        descricao: data.descricao,
        grupoId: data.grupoId,
      },
    });

    result.status = "Sucesso"
    result.dados = subGrupo
    return result      
  } catch (err: any) {
    const erro = <tyErro>err;
    result.status = "Erro"
    result.menssagem = erro.code
    return result 
  }
}


//Função para excluir um registro do subgrupo
export async function DeleteSubGrupo(subGrupoId: number) {
    let result:tyResult = <tyResult>{};
    try {      
      const grupo = await prisma.subGrupo.delete({
        where: { id: subGrupoId },
      });
      result.status = "Sucesso"
      result.dados = grupo
      return result  

    } catch (err: any) {
      const erro = <tyErro>err;
      result.status = "Erro"
      result.menssagem = erro.code
      return result 

    }
}

