'use server'

import { tyErro, tyResult, tyOrcamento } from "@/types/types"
import {Periodo } from "@prisma/client"
import prisma from "@/lib/db"

type retorno = {
  status: string
  menssagem?: string
  regId: number
}

// Função para verificar se existe um periodo e criar o registro se não houver.
export async function VerificaPeriodo(userID: number | undefined, periodo: string) {
  const resultado:retorno = <retorno>{};
  //let novoPeriodo;
  
  try {
    const retPeriodo = await prisma.periodo.findMany({
      where: { userId: userID, periodo: periodo},
      
    });
    if(retPeriodo.length < 1){
      const novoPeriodo = await prisma.periodo.create({
        data: { 
          periodo: periodo,
          status: 'A',
          dtAtualizacao: new Date(),
          userId: userID,
        }
      })
      resultado.regId =novoPeriodo.id
    }else{
      resultado.regId = retPeriodo[0].id;
    }
    resultado.status = "Sucesso"
    return resultado
  } catch (error) {
    const erro = <tyErro>error;
    resultado.status = "Erro"
    resultado.menssagem = erro.code
    resultado.regId = 0
    return resultado  
  }

}

export async function RetOrcamento(periodoId: number | undefined) {
  let orcamentos: tyOrcamento[];
  try {
    orcamentos = await prisma.$queryRaw`
      Select
	      O.id as orcamentoId,
        O.valor as valor,
        G.nome as nomeGrupo,
        G.tipo as tipoGrupo,
        O.grupoId as grupoId,
        O.periodoId as periodoId
      from
	      Orcamento as O Left Join Grupo as G
	      On O.grupoId = G.id
      Where
	      O.periodoId =  ${periodoId} and 
        G.ativo = true and G.tipo != "M"
      Order By
	      tipoGrupo,
        nomeGrupo  
    `
    return  orcamentos
  } catch (error) {
    return orcamentos = [];
  }
}

export async function CriarOrcamentos(periodoID: number, usuarioId: number | undefined) {
  let result:tyResult = <tyResult>{};

  try {    
    const grupos = await prisma.grupo.findMany({
      where: { userId: usuarioId, ativo: true, tipo: { not: "M",}}
    })
  
    const orcamentos = await Promise.all(grupos.map(grupo => {
      return prisma.orcamento.create({
        data:{
          valor: 0,
          grupoId: grupo.id,
          periodoId: periodoID
        }
      });
    }));

    result.status = "Sucesso"
    result.dados = orcamentos
    return result   

  } catch (error) {
    const erro = <tyErro>error;
    result.status = "Erro"
    result.menssagem = erro.code
    return result        
  }

}

//Essa função atualiza o valor de um orçamento especifico
export async function AtualizaOrcamento(orcamentoId: number, valor: number){
  let result:tyResult = <tyResult>{};

  try {
    const orcamento = await prisma.orcamento.updateMany({
      data: {
        valor: valor,
      },
      where:{
        id: orcamentoId,
      }
    });
    result.status = "Sucesso"
    result.dados = orcamento
    return result 

  } catch (error) {
    const erro = <tyErro>error
    result.status = "Erro"
    result.menssagem = erro.code
    return result 
  }

}


//Essa função acrecenta novos grupos para os orçamentos de um periodo
export async function AtualizaOrcamentos(periodoID: number, usuarioId: number | undefined) {
  // 1 Passo Retornar todos os Grupos em uma lista
  // 2 Faça um loop para verificar se o grupo já foi cadastrodo no orcamento do periodo
  // 3 Cadastro o Grupo no orçamento do periodo
  let result:tyResult = <tyResult>{};

  try { 
    //Passo 1 - Retornar todos os Grupos em uma lista 
    const grupos = await prisma.grupo.findMany({
      where: { userId: usuarioId, ativo: true, tipo: { not: "M",}}
    })
    //Passo 2 loop para verificar se o grupo já foi cadastrodo no orcamento do periodo
    const orcamentos = await Promise.all(grupos.map( async grupo =>{
      const retOrcamento = await prisma.orcamento.findMany({
        where: { grupoId: grupo.id, periodoId: periodoID},
        
      });
      //Passo 3 se ainda não tem aadastra o Grupo no orçamento do periodo
      if(retOrcamento.length < 1){
        return prisma.orcamento.create({
          data:{
            valor: 0,
            grupoId: grupo.id,
            periodoId: periodoID
          }
        });
      }
    })
  );
    result.status = "Sucesso"
    result.dados = grupos
    return result   

  } catch (error) {
    const erro = <tyErro>error;
    result.status = "Erro"
    result.menssagem = erro.code
    return result        
  }

}

//Essa função retorna a quantidade de grupos 
//ativos de um usuário em um periodo especifico
//Essa função acrecenta novos grupos para os orçamentos de um periodo
export async function gruposAtivos(periodoID: number, usuarioId: number | undefined) {
  let retorno:number = 0;
  try { 
    //Passo 1 - Retornar todos os Grupos em uma lista 
    const grupos = await prisma.grupo.findMany({
      where: { userId: usuarioId, ativo: true, tipo: { not: "M",}}
    })
    retorno = grupos.length;
  }catch(err){
    retorno = 0
  }
  return retorno
}


