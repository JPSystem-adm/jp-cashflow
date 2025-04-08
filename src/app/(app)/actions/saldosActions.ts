'use server'

import { tyErro, tyResult, tySaldo, tySaldos } from "@/types/types"
import prisma from "@/lib/db"
import { retPeriodoAnterior } from "@/lib/formatacoes"
import { RetSomatoriasPeriodo } from "./graficosActions"

type retorno = {
  status: string
  menssagem?: string
  regId: number
}

/**
 * Esta função calcula os saldos das fontes no periodo
 * @param periodoId - O id do periodo que sera analizado.
 * @param userId - O id do usuario.
 * @returns Um array do tipo tySaldos com os saldos atualizados no periodo.
 */
export async function SaldosFontesPorPeriodo( 
                        periodoId: number | 0, 
                        userId: number | 0 ) {
  let saldos: tySaldos[];
  try{
    saldos = await prisma.$queryRaw`
      SELECT
        fontes.id as fonteId,
        fontes.nome as fonte,
        ${periodoId} as periodoId,
        ${userId} as userId,
        IFNULL(saldo.valorFonte, 0) as totFonte
      FROM
      (
        (
          SELECT 
            fonteId as fonte,
		        SUM( CASE WHEN operacao = "C" THEN valor ELSE 0 END) - 
            SUM(CASE WHEN operacao = "D" THEN valor ELSE 0 END) as valorFonte
	        FROM 
		        cashFlow.Lancamento
		      WHERE
		        periodoId = ${periodoId}
		      GROUP BY
		        fonteId
	      )
	      UNION
	      (	
          SELECT 
			      fonteIdD as fonte,
			      SUM(valor) as valorFonte
		      FROM 
			      cashFlow.Lancamento
		      WHERE
			      periodoId = ${periodoId} AND 
			      fonteIdD > 0
		      GROUP BY
			      fonteIdD
	      )
        UNION
        ( 
          SELECT
		        fonteId as fonte,
            valor as valorFonte
	        FROM 
	          cashFlow.Saldo
	        WHERE
            periodoId = ${periodoId} AND
            fonteId > 0
        )
      ) as saldo RIGHT JOIN 
      ( 
        SELECT 
          * 
        FROM 
          cashFlow.Fonte 
        WHERE 
          userId = ${userId}
      ) as fontes
      ON saldo.fonte = fontes.id
    GROUP BY
	    fontes.id,
      fontes.nome
    `
    return saldos
  }catch ( error ){
    return saldos = [];
  }
}

export async function RetSaldos(periodoId: number | undefined) {
  let saldos: tySaldo[];

  try {
    saldos = await prisma.$queryRaw`
      Select
	      S.id as saldoId,
        S.valor as valor,
        F.nome as nomeFonte,
        F.tipo as tipoFonte,
        S.fonteId as fonteId,
        S.periodoId as periodoId
      from
	      Saldo as S Left Join Fonte as F
	      On S.fonteId = F.id
      Where
	      S.periodoId =  ${periodoId} and 
        F.ativo = true
      Order By
	      tipoFonte,
        nomeFonte  
    `
    return  saldos
  } catch (error) {
    return saldos = [];
  }
}

export async function CriarSaldos(periodo: string, usuarioId: number){
  let result:tyResult = <tyResult>{};
  const periodoAnterior = await retPeriodoAnterior(periodo);
  const periodoAtualId = await RetIdPeriodo(periodo, usuarioId);
  const periodoAnteriorId = await RetIdPeriodo(periodoAnterior, usuarioId);
  try {
    //Nova consulta de Saldos
    const retSaldos = await RetSomatoriasPeriodo(periodoAnteriorId);

    if(retSaldos.length > 0){      
      const novosSaldos = await Promise.all(retSaldos.map(saldo => {
        return prisma.saldo.create({
          data:{
            valor: saldo.saldoAtual,
            fonteId: saldo.FonteId,
            periodoId: periodoAtualId
          }
        });
      }));
      result.dados = novosSaldos
    }else{
      //Consulta anterior de Saldos
      const retSaldos2 = await SaldosFontesPorPeriodo(periodoAnteriorId, usuarioId);
      const novosSaldos2 = await Promise.all(retSaldos2.map(saldo => {
        return prisma.saldo.create({
          data:{
            valor: saldo.totFonte,
            fonteId: saldo.fonteId,
            periodoId: periodoAtualId
          }
        });
      }));
      result.dados = novosSaldos2
    }
    result.status = "Sucesso"
    return result
  } catch (error) {
    const erro = <tyErro>error;
    result.status = "Erro"
    result.menssagem = erro.code
    return result   
  }
}

//Essa função retorna a quantidade de fontes 
//ativas de um usuário em um periodo especifico
export async function fontesAtivas(periodoID: number, usuarioId: number | undefined) {
  let retorno:number = 0;
  try { 
    //Passo 1 - Retornar todos as fontes em uma lista 
    const fontes = await prisma.fonte.findMany({
      where: { userId: usuarioId, ativo: true, tipo: { not: "M",}}
    })
    retorno = fontes.length;
  }catch(err){
    retorno = 0
  }
  return retorno
}

export async function RetIdPeriodo(periodoNome: string | "", usuarioId: number | 0){
  try {
    const periodo = await prisma.periodo.findMany({
      where: { periodo: periodoNome, userId: usuarioId},
    });
    return periodo[0].id;
  } catch (error) {
    return 0;
  }
}

//Essa função atualiza o valor de um Saldo especifico
export async function AtualizaSaldo(saldoId: number, valor: number){
  let result:tyResult = <tyResult>{};

  try {
    const saldo = await prisma.saldo.updateMany({
      data: {
        valor: valor,
      },
      where:{
        id: saldoId,
      }
    });
    result.status = "Sucesso"
    result.dados = saldo
    return result 

  } catch (error) {
    const erro = <tyErro>error
    result.status = "Erro"
    result.menssagem = erro.code
    return result 
  }

}

//Essa função acrecenta novas fontes para os saldos iniciais de um periodo
export async function AtualizaSaldos(periodoID: number, usuarioId: number | undefined) {
  // 1 Passo Retornar todos oa fontes em uma lista
  // 2 Faça um loop para verificar se a fonte já foi cadastroda nos saldos do periodo
  // 3 Cadastro a Fonte nos saldos do periodo
  let result:tyResult = <tyResult>{};

  try { 
    //Passo 1 - Retornar todos as Fontes em uma lista 
    const fontes = await prisma.fonte.findMany({
      where: { userId: usuarioId, ativo: true}
    })
    //Passo 2 loop para verificar se a fonte já foi cadastroda nos saldos do periodo.
    const saldos = await Promise.all(fontes.map( async fonte =>{
      const retSaldo = await prisma.saldo.findMany({
        where: { fonteId: fonte.id, periodoId: periodoID},
        
      });
      //Passo 3 se ainda não tem cadastra a fonte nos saldos do periodo
      if(retSaldo.length < 1){
        return prisma.saldo.create({
          data:{
            valor: 0,
            fonteId: fonte.id,
            periodoId: periodoID
          }
        });
      }
    })
  );
    result.status = "Sucesso"
    result.dados = fontes
    return result   

  } catch (error) {
    const erro = <tyErro>error;
    result.status = "Erro"
    result.menssagem = erro.code
    return result        
  }

}
