"use server"

//import { tySubGrupo, tyGrupo,  tyGrupoLista } from '@/types/types';
import prisma from "@/lib/db"

//Função para retornar os dados do grupos para preencher
//as caixa de seleção de grupos retornar apenas os ativos
export async function SelectGrupos(usuarioId: number | undefined) {
  try {
    const activeGrupos = await prisma.grupo.findMany({
      where: { 
        userId: usuarioId, 
        ativo: true 
      },
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: 'asc',
      },
    })
    return activeGrupos
  } catch (error) {
    console.error("Erro ao buscar grupos ativos:", error)
    throw error
  }
}

//Função para retornar os dados do SubGrupos
//associado a um determinado Grupo para preencher
//as caixa de seleção de SubGrupos, retornar apenas os ativos
export async function SelectSubGrupos(grupoID: number) {
  try {
    const activeSubGrupos = await prisma.subGrupo.findMany({
      where: {
        grupoId: grupoID,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: 'asc',
      },
    })
    return activeSubGrupos
  } catch (error) {
    console.error("Erro ao buscar subGrupos ativos:", error)
    throw error
  }
}

//Função para retornar os dados das fontes para preencher
//as caixa de seleção de fontes retornar apenas os ativos
export async function SelectFontes(usuarioId: number | undefined) {
  try {
    const activeFontes = await prisma.fonte.findMany({
      where: { 
        userId: usuarioId, 
        ativo: true 
      },
      select: {
        id: true,
        nome: true,
      },
      orderBy: {
        nome: 'asc',
      },
    })
    return activeFontes
  } catch (error) {
    console.error("Erro ao buscar grupos ativos:", error)
    throw error
  }
}