'use server'


import { getServerSession } from "next-auth";
import { auth as authOptions } from "@/lib/auth-config";


// Retorna uma lista de tyDespesaGrafico com os dados necessario para
// o grafico de despsas em relação aos valores orçados de um detrminado periodo
export async function RetEstatisticaDespesas(periodoId: number | undefined) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token; // Pega o token armazenado
  const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/estatisticaDespesas?periodoId=${periodoId}`
  
  try {
    // ✅ Executa o Endpoint da API
    const response = await fetch(urlAPI, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Passa o token aqui!
      }
    });
    
    if (!response.ok) {
      throw new Error("Erro ao buscar dados da estatistica Despesas");
    }
    
    return response.json();

  } catch (error) {
    return [];
  }
}

// Retorna uma lista de tyEntradasGrafico com os dados necessario para
// o grafico de pizza de destribuição das entradas no periodo
export async function RetEstatisticaEntradas(periodoId: number | undefined) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token; // Pega o token armazenado

  const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`

  try {
 
    const response = await fetch(`${urlAPI}estatisticaEntradas?periodoId=${periodoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Passa o token aqui!
      }
    });
    
    
    if (!response.ok) {
      throw new Error("Erro ao buscar dados da estatistica Entradas");
    }
    return response.json();
  } catch (error) {
    return [];
  }
}

// Retorna uma lista dos grupos de despesas para o combo 
// do grafico de detalhes do grupo.
export async function ListaDespesasPeriodo(periodoId: number | undefined) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token; // Pega o token armazenado
  
  const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`
  try {
    // ✅ Executa o Endpoint da API
    const response = await fetch(`${urlAPI}despesasPeriodo?periodoId=${periodoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Passa o token aqui!
      }
    });
    
    if (!response.ok) {
      throw new Error("Erro ao buscar lista de despesas");
    }
    return response.json();

  } catch (error) {
    return  [];
  }
}

// Retorna uma lista do tipo tySubGruposGrafico com as somatorias
// dos subgrupos para o grafico de detalhes do grupo
export async function ListaSubContasPorContas(periodoId: number | undefined, grupoId: number) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token; // Pega o token armazenado

  const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`

  try {
    const response = await fetch(`${urlAPI}subContasPorContas?periodoId=${periodoId}&grupoId=${grupoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Passa o token aqui!
      }
    });
    if (!response.ok) {
      throw new Error("Erro ao buscar lista das subContas");
    }
    return response.json();
  } catch (error) {
    return [];
  }
}

// Retorna uma lista de fontes com as somatorias
// no periodo
export async function RetSomatoriasPeriodo(periodoId: number | undefined) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.token; // Pega o token armazenado

  const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`

  try {
    // ✅ Executa o Endpoint da API
    const response = await fetch(`${urlAPI}somatoriaPeriodo?periodoId=${periodoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Passa o token aqui!
      }
    });
    
    
    if (!response.ok) {
      throw new Error("Erro ao buscar a somatória do periodo");
    }
    return response.json();
  } catch (error) {
    return [];
  }
}