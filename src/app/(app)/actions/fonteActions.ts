// src/app/(app)/actions/fonteActions.ts

//'use server'

import { tyFonte, tyErro, tyResult } from "@/types/types";
import { getTokenFromCookie } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_BASEURL_API;

// Função para listar fontes
export async function ListaFontes() {
  const token = getTokenFromCookie();
  if (!token) return [];

  const res = await fetch(`${API_URL}/api/private/restrita/fonte`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  return res.json();
}

// Função para criar uma fonte no banco de dados
export async function CreateFonte(data: tyFonte): Promise<tyResult> {
  const token = getTokenFromCookie();
  let result: tyResult = {};

  try {
    const res = await fetch(`${API_URL}/api/private/restrita/fonte`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome: data.nome.toUpperCase(),
        descricao: data.descricao,
        tipo: data.tipo,
        ativo: data.ativo,
      }),
    });

    const json = await res.json();
    result.status = res.ok ? "Sucesso" : "Erro";
    result.dados = json;
    result.menssagem = json?.error || undefined;
    return result;
  } catch (error) {
    result.status = "Erro";
    result.menssagem = (error as tyErro).code || "Erro inesperado";
    return result;
  }
}

// Função para deletar uma fonte
export async function DeleteFontes(id: number) {
  const token = getTokenFromCookie();

  const res = await fetch(`${API_URL}/api/private/restrita/fonte/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

// Função para atualizar uma fonte existente
export async function AlteraFonte(data: tyFonte): Promise<tyResult> {
  const token = getTokenFromCookie();
  let result: tyResult = {};

  try {
    const res = await fetch(`${API_URL}/api/private/restrita/fonte/${data.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome: data.nome.toUpperCase(),
        descricao: data.descricao,
        tipo: data.tipo,
        ativo: data.ativo,
      }),
    });

    const json = await res.json();
    result.status = res.ok ? "Sucesso" : "Erro";
    result.dados = json;
    result.menssagem = json?.error || undefined;
    return result;
  } catch (err) {
    result.status = "Erro";
    result.menssagem = (err as tyErro).code || "Erro inesperado";
    return result;
  }
}













// // src/app/(app)/actions/fonteActions.ts

// 'use server'

// import { tyFonte, tyErro, tyResult } from "@/types/types"
// import prisma from "@/lib/db"

// // Função para listar fontes
// export async function ListaFontes() {
//   const userID =  0;
//   const fontes = await prisma.fonte.findMany({
//     where: { userId: userID },
//   });
  
//   return Promise.resolve(fontes); //Promise.resolve(fontes);
// }

// // Função para criar uma fonte no banco de dados
// export async function CreateFonte(data: tyFonte) {
//   let result:tyResult = <tyResult>{};
//   try {
//     const fonte = await prisma.fonte.create({
//       data: {
//         nome: data.nome.toUpperCase(),
//         descricao: data.descricao,
//         tipo: data.tipo.toString(),
//         ativo: data.ativo,
//         userId: data.userId,
//       },
//     })
//     result.status = "Sucesso"
//     result.dados = fonte
//     return result    
    
//   } catch (error) {

//     const erro = <tyErro>error;
//     result.status = "Erro"
//     result.menssagem = erro.code
//     return result    
//   }
// }

// // Função para listar fontes (ajuste conforme a lógica de negócio)
// export async function DeleteFontes(index: number) {
//   const fonte = await prisma.fonte.delete({
//     where: { id: index },
//   });
//   //revalidatePath("/cadastros/fonte")
  
//   return Promise.resolve(fonte); //Promise.resolve(fontes);
// }

// //Essa função altera os dados do subGrupo
// export async function AlteraFonte(data: tyFonte) {
//   let result:tyResult = <tyResult>{};
//   try {
//     const fonte = await prisma.fonte.update({
//       where: {id: data.id},
//       data: {
//         nome: data.nome.toUpperCase(),
//         descricao: data.descricao,
//         tipo: data.tipo,
//         ativo: data.ativo,
//       },
//     })
//     result.status = "Sucesso"
//     result.dados = fonte
//     return result     
//   } catch (err) {
//     const erro = <tyErro>err;
//     result.status = "Erro"
//     result.menssagem = erro.code
//     return result
//   }
// }



