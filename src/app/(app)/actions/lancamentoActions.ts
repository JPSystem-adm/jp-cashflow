// // src/app/(app)/actions/lancamentoActions.tsx
// 'use server'


// src/app/(app)/actions/lancamentoActions.ts
import { getTokenFromCookie } from "@/lib/getToken";
import { tyLancamento , tyErro, tyResult } from "@/types/types";
import { FormataDataStringFusoLocal } from "@/lib/formatacoes";

export async function getLancamentos(periodoId: number, grupoId?: number, subGrupoId?: number, fonteId?: number): Promise<tyLancamento[]> {
  const token = getTokenFromCookie();
  if (!token) {
    console.error("Token não encontrado.");
    return [];
  }

  const query = new URLSearchParams();
  if (periodoId) query.append("periodoId", periodoId.toString());
  if (grupoId) query.append("grupoId", grupoId.toString());
  if (subGrupoId) query.append("subGrupoId", subGrupoId.toString());
  if (fonteId) query.append("fonteId", fonteId.toString());

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/lancamentos?${query.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Erro na resposta:", await res.json());
      return [];
    }

    const dados = await res.json();

    // Converte datas e ajusta tipos conforme necessário
    return dados.map((l: any) => ({
      ...l,
      dtLancamento: FormataDataStringFusoLocal(l.dtLancamento),
    })) as tyLancamento[];

  } catch (err) {
    console.error("Erro ao buscar lançamentos:", err);
    return [];
  }
}


export async function DeleteLancamentos(id: number): Promise<boolean> {
  const token = getTokenFromCookie();
  if (!token) {
    console.error("Token não encontrado.");
    return false;
  }
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/lancamentos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Erro ao excluir lançamento:", err.error?.message || err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    return false;
  }
}

export async function AlteraLancamento(data: tyLancamento): Promise<tyResult> {
  const result: tyResult = { status: "Erro" };
  const token = getTokenFromCookie();

  if (!token || !data.lancamentoId) {
    result.menssagem = "Token ou ID do lançamento ausente.";
    return result;
  }

  console.log("DADOS: ", data)

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/lancamentos/${data.lancamentoId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descricao: data.descricao,
          valor: data.valor,
          dtLancamento: data.dtLancamento,
          subGrupoId: data.subGrupoId,
          fonteId: data.fonteId,
          fonteIdD: data.fonteIdD,
        }),
      }
    );

    const json = await res.json();
    console.log("RES: ", json)
    if (!res.ok) {
      console.error("Erro na API:", json.error?.message);
      result.menssagem = json.error?.message || "Erro ao atualizar lançamento.";
      return result;
    }

    result.status = "Sucesso";
    result.dados = json;
    return result;
  } catch (err) {
    console.error("Erro ao conectar com a API:", err);
    result.menssagem = "Erro interno ao tentar alterar o lançamento.";
    return result;
  }
}

export async function CriarLancamento(dados: tyLancamento): Promise<tyResult> {
  const result: tyResult = { status: "Erro" };
  const token = getTokenFromCookie();

  if (!token) {
    result.menssagem = "Token não encontrado.";
    return result;
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/lancamentos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          valor: dados.valor,
          dtLancamento: dados.dtLancamento,
          operacao: dados.operacao,
          subGrupoId: dados.subGrupoId,
          fonteId: dados.fonteId,
          periodoId: dados.periodoId,
          descricao: dados.descricao,
          fonteIdD: dados.fonteIdD,
        }),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      console.error("Erro na API:", json.error?.message);
      result.menssagem = json.error?.message || "Erro ao criar lançamento.";
      return result;
    }

    result.status = "Sucesso";
    result.dados = json.lancamento;
    return result;
  } catch (err) {
    console.error("Erro ao conectar com a API:", err);
    result.menssagem = "Erro interno ao tentar criar o lançamento.";
    return result;
  }
}

export async function RetOperacao(grupoId: number): Promise<"D" | "C" | "T" | null> {
  const token = getTokenFromCookie();
  if (!token) return null;
console.log("RetOperacao-GrupoId: ", grupoId)
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/grupo/${grupoId}/operacao`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.tipo || null;
  } catch (error) {
    console.error("Erro ao buscar operação:", error);
    return null;
  }
}















// import { tyErro, tyResult, tyLancamento } from "@/types/types"

// import prisma from "@/lib/db"
// import { convertLocalDateToUTC, convertUTCToLocalDate, FormataDataStringFusoLocal,  } from '@/lib/formatacoes';
// import { formatDate, toDate } from "date-fns";



// type retorno = {
//   status: string
//   menssagem?: string
//   regId: number
// }

// //incluir um novo lançamento
// export async function CriarLancamento(dados: tyLancamento){
//   let result:tyResult = <tyResult>{};
//   try {
//     const lancamento = await prisma.lancamento.create({
//       data: {
//         valor: dados.valor,
//         dtLancamento:  toDate(formatDate(dados.dtLancamento || new Date(), 'yyyy-MM-dd')),
//         operacao: dados.operacao,
//         subGrupoId: dados.subGrupoId ?? 0,
//         fonteId: dados.fonteId ?? 0,
//         periodoId: dados.periodoId ?? 0,
//         descricao: dados.descricao,
//         fonteIdD: dados.fonteIdD,
//       }
//     });
//     result.status = "Sucesso"
//     result.dados = lancamento
//     return result     

//   } catch (error) {
//     console.log("Erro: ", error)
//     const erro = <tyErro>error;
//     result.status = "Erro"
//     result.menssagem = erro.code
//     return result 
//   }
// }

// // Função que retorna o tipo de operação de uma conta
// export async function RetOperacao(grupoId:number){
//   const oper = await prisma.grupo.findUnique({
//     where:{
//       id: grupoId,
//     },
//   })
//   return oper?.tipo;
// }

// //Retorna os dados dos lancamentos de um determinado periodo
// export async function getLancamentos(periodoId: number, grupoId?: number, subGrupoId?: number, fonteId?: number) {
//   const lancamentos = await prisma.lancamento.findMany({
//     where: {
//       periodoId: periodoId,
//       subGrupo: {
//         ...grupoId && { grupoId: grupoId },
//       },
//       ...subGrupoId && { subGrupoId: subGrupoId },
//       ...(fonteId ? {
//         OR: [
//           { fonteId: fonteId },
//           { fonteIdD: fonteId }
//         ]
//       } : {}), // Só aplica o filtro se fonteId estiver presente
//       //...fonteId && { fonteId: fonteId },
//     },
//     include: {
//       periodo: true,
//       subGrupo: {
//         include: {
//           grupo: true,
//         },
//       },
//       fonte: true,
//       fonteD: true,
//     },
//     orderBy: [
//       { dtLancamento: 'desc' },
//       { id: 'desc' },
//     ],
//   });
//   const dados:tyLancamento[] = lancamentos.map(lancamento => ({
//     lancamentoId: lancamento.id,
//     valor: lancamento.valor,
//     dtLancamento: FormataDataStringFusoLocal(lancamento.dtLancamento),
//     descricao: lancamento.descricao || undefined,
//     operacao: lancamento.operacao,
//     periodoId: lancamento.periodoId,
//     periodo: lancamento.periodo?.periodo,
//     subGrupoId: lancamento.subGrupoId,
//     subGrupo: lancamento.subGrupo?.nome,
//     fonteId: lancamento.fonteId,
//     fonteIdD: lancamento.fonteIdD,
//     fontes: lancamento.fonteIdD ? `De: ${lancamento.fonte?.nome}\nPara: ${lancamento.fonteD?.nome}` : lancamento.fonte?.nome,
//     grupoId: lancamento.subGrupo?.grupoId,
//     grupo: lancamento.subGrupo?.grupo?.nome,
//   }));
//   return dados
// }

// // Função para excluir um lançamento
// export async function DeleteLancamentos(index: number) {
//   const lancamento = await prisma.lancamento.delete({
//     where: { id: index },
//   });
  
//   return Promise.resolve(lancamento); //Promise.resolve(fontes);
// }

// //Essa função altera os dados do Lançamento
// export async function AlteraLancamento(data: tyLancamento) {
//   let result:tyResult = <tyResult>{};
//   try {
//     const lancamento = await prisma.lancamento.update({
//       where: {id: data.lancamentoId},
//       data: {
//         valor: data.valor,
//         dtLancamento: toDate(formatDate(data.dtLancamento || new Date(), 'yyyy-MM-dd')), //data.dtLancamento ?? new Date(),
//         subGrupoId: data.subGrupoId ?? 0,
//         fonteId: data.fonteId ?? 0,
//         descricao: data.descricao,
//         fonteIdD: data.fonteIdD,
//       },
//     })
//     result.status = "Sucesso"
//     result.dados = lancamento
//     return result     
//   } catch (err) {
//     const erro = <tyErro>err;
//     result.status = "Erro"
//     result.menssagem = erro.code
//     return result
//   }
// }
