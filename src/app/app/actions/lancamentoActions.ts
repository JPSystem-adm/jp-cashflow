
'use server'

import { tyErro, tyResult, tyLancamento } from "@/types/types"
import prisma from "@/lib/db"
import { convertLocalDateToUTC, convertUTCToLocalDate, FormataDataStringFusoLocal,  } from '@/lib/formatacoes';
import { formatDate, toDate } from "date-fns";



type retorno = {
  status: string
  menssagem?: string
  regId: number
}

//incluir um novo lançamento
export async function CriarLancamento(dados: tyLancamento){
  let result:tyResult = <tyResult>{};
  try {
    const lancamento = await prisma.lancamento.create({
      data: {
        valor: dados.valor,
        dtLancamento:  toDate(formatDate(dados.dtLancamento || new Date(), 'yyyy-MM-dd')),
        operacao: dados.operacao,
        subGrupoId: dados.subGrupoId ?? 0,
        fonteId: dados.fonteId ?? 0,
        periodoId: dados.periodoId ?? 0,
        descricao: dados.descricao,
        fonteIdD: dados.fonteIdD,
      }
    });
    result.status = "Sucesso"
    result.dados = lancamento
    return result     

  } catch (error) {
    console.log("Erro: ", error)
    const erro = <tyErro>error;
    result.status = "Erro"
    result.menssagem = erro.code
    return result 
  }
}

// Função que retorna o tipo de operação de uma conta
export async function RetOperacao(grupoId:number){
  const oper = await prisma.grupo.findUnique({
    where:{
      id: grupoId,
    },
  })
  return oper?.tipo;
}

//Retorna os dados dos lancamentos de um determinado periodo
export async function getLancamentos(periodoId: number, grupoId?: number, subGrupoId?: number, fonteId?: number) {
  const lancamentos = await prisma.lancamento.findMany({
    where: {
      periodoId: periodoId,
      subGrupo: {
        ...grupoId && { grupoId: grupoId },
      },
      ...subGrupoId && { subGrupoId: subGrupoId },
      ...(fonteId ? {
        OR: [
          { fonteId: fonteId },
          { fonteIdD: fonteId }
        ]
      } : {}), // Só aplica o filtro se fonteId estiver presente
      //...fonteId && { fonteId: fonteId },
    },
    include: {
      periodo: true,
      subGrupo: {
        include: {
          grupo: true,
        },
      },
      fonte: true,
      fonteD: true,
    },
    orderBy: [
      { dtLancamento: 'desc' },
      { id: 'desc' },
    ],
  });
  const dados:tyLancamento[] = lancamentos.map(lancamento => ({
    lancamentoId: lancamento.id,
    valor: lancamento.valor,
    dtLancamento: FormataDataStringFusoLocal(lancamento.dtLancamento),
    descricao: lancamento.descricao || undefined,
    operacao: lancamento.operacao,
    periodoId: lancamento.periodoId,
    periodo: lancamento.periodo?.periodo,
    subGrupoId: lancamento.subGrupoId,
    subGrupo: lancamento.subGrupo?.nome,
    fonteId: lancamento.fonteId,
    fonteIdD: lancamento.fonteIdD,
    fontes: lancamento.fonteIdD ? `De: ${lancamento.fonte?.nome}\nPara: ${lancamento.fonteD?.nome}` : lancamento.fonte?.nome,
    grupoId: lancamento.subGrupo?.grupoId,
    grupo: lancamento.subGrupo?.grupo?.nome,
  }));
  return dados
}

// Função para excluir um lançamento
export async function DeleteLancamentos(index: number) {
  const lancamento = await prisma.lancamento.delete({
    where: { id: index },
  });
  
  return Promise.resolve(lancamento); //Promise.resolve(fontes);
}

//Essa função altera os dados do Lançamento
export async function AlteraLancamento(data: tyLancamento) {
  let result:tyResult = <tyResult>{};
  try {
    const lancamento = await prisma.lancamento.update({
      where: {id: data.lancamentoId},
      data: {
        valor: data.valor,
        dtLancamento: toDate(formatDate(data.dtLancamento || new Date(), 'yyyy-MM-dd')), //data.dtLancamento ?? new Date(),
        subGrupoId: data.subGrupoId ?? 0,
        fonteId: data.fonteId ?? 0,
        descricao: data.descricao,
        fonteIdD: data.fonteIdD,
      },
    })
    result.status = "Sucesso"
    result.dados = lancamento
    return result     
  } catch (err) {
    const erro = <tyErro>err;
    result.status = "Erro"
    result.menssagem = erro.code
    return result
  }
}
