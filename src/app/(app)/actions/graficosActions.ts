// // src/app/(app)/actions/graficosActions.ts

// import { getTokenFromCookie } from "@/lib/getToken";

// // Retorna uma lista de tyDespesaGrafico com os dados necessario para
// // o grafico de despsas em relação aos valores orçados de um detrminado periodo
// export async function RetEstatisticaDespesas(periodoId: number | undefined) {
//   //const session = await getServerSession(authOptions);
//   //const token = session?.user?.token; // Pega o token armazenado
//   const token = getTokenFromCookie();
//   const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/estatisticaDespesas?periodoId=${periodoId}`
  
//   try {
//     // ✅ Executa o Endpoint da API
//     const response = await fetch(urlAPI, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}` // Passa o token aqui!
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error("Erro ao buscar dados da estatistica Despesas");
//     }
    
//     return response.json();

//   } catch (error) {
//     return [];
//   }
// }

// // Retorna uma lista de tyEntradasGrafico com os dados necessario para
// // o grafico de pizza de destribuição das entradas no periodo
// export async function RetEstatisticaEntradas(periodoId: number | undefined) {
//   //const session = await getServerSession(authOptions);
//   //const token = session?.user?.token; // Pega o token armazenado
//   const token = getTokenFromCookie();
//   const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`

//   try {
 
//     const response = await fetch(`${urlAPI}estatisticaEntradas?periodoId=${periodoId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}` // Passa o token aqui!
//       }
//     });
    
    
//     if (!response.ok) {
//       throw new Error("Erro ao buscar dados da estatistica Entradas");
//     }
//     return response.json();
//   } catch (error) {
//     return [];
//   }
// }

// // Retorna uma lista dos grupos de despesas para o combo 
// // do grafico de detalhes do grupo.
// export async function ListaDespesasPeriodo(periodoId: number | undefined) {
//   //const session = await getServerSession(authOptions);
//   //const token = session?.user?.token; // Pega o token armazenado
//   const token = getTokenFromCookie();

//   const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`
//   try {
//     // ✅ Executa o Endpoint da API
//     const response = await fetch(`${urlAPI}despesasPeriodo?periodoId=${periodoId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}` // Passa o token aqui!
//       }
//     });
    
//     if (!response.ok) {
//       throw new Error("Erro ao buscar lista de despesas");
//     }
//     return response.json();

//   } catch (error) {
//     return  [];
//   }
// }

// // Retorna uma lista do tipo tySubGruposGrafico com as somatorias
// // dos subgrupos para o grafico de detalhes do grupo
// export async function ListaSubContasPorContas(periodoId: number | undefined, grupoId: number) {
//   //const session = await getServerSession(authOptions);
//   //const token = session?.user?.token; // Pega o token armazenado
//   const token = getTokenFromCookie();

//   const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`

//   try {
//     const response = await fetch(`${urlAPI}subContasPorContas?periodoId=${periodoId}&grupoId=${grupoId}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}` // Passa o token aqui!
//       }
//     });
//     if (!response.ok) {
//       throw new Error("Erro ao buscar lista das subContas");
//     }
//     return response.json();
//   } catch (error) {
//     return [];
//   }
// }

// // Retorna uma lista de fontes com as somatorias
// // no periodo
// export async function RetSomatoriasPeriodo(periodoId: number | undefined, modo: string) {
//   //const session = await getServerSession(authOptions);
//   //const token = session?.user?.token; // Pega o token armazenado
//   const token = getTokenFromCookie();

//   const urlAPI = `${process.env.NEXT_PUBLIC_BASEURL_API}/api/private/restrita/graficos/`

//   try {
//     // ✅ Executa o Endpoint da API
//     const response = await fetch(`${urlAPI}somatoriaPeriodo?periodoId=${periodoId}&modo=${modo}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}` // Passa o token aqui!
//       }
//     });
    
    
//     if (!response.ok) {
//       throw new Error("Erro ao buscar a somatória do periodo");
//     }
//     return response.json();
//   } catch (error) {
//     return [];
//   }
// }

// src/app/(app)/actions/graficosActions.ts
import { getTokenFromCookie } from "@/lib/getToken";
import type {
  tyDespesaGrafico,
  tyEntradasGrafico,
  tySubGruposGrafico,
  tySomatoriasPeriodo,
  tySelects,
} from "@/types/types";

function apiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env");
  return v.replace(/\/$/, "");
}

function isPositiveInt(n: number | undefined): n is number {
  return typeof n === "number" && Number.isInteger(n) && n > 0;
}

function normalizeModo(modo: string): string {
  const m = (modo ?? "").trim();
  return m ? m : "GERAL";
}

function authHeaders(token: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function fetchArray<T>(url: string, token: string | null): Promise<T[]> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

// Grafico de despesas (orçado x real) no período
export async function RetEstatisticaDespesas(
  periodoId: number | undefined
): Promise<tyDespesaGrafico[]> {
  if (!isPositiveInt(periodoId)) return [];

  const token = getTokenFromCookie();
  const url = `${apiBaseUrl()}/api/private/restrita/graficos/estatisticaDespesas?periodoId=${periodoId}`;

  return fetchArray<tyDespesaGrafico>(url, token);
}

// Grafico pizza (entradas) no período
export async function RetEstatisticaEntradas(
  periodoId: number | undefined
): Promise<tyEntradasGrafico[]> {
  if (!isPositiveInt(periodoId)) return [];

  const token = getTokenFromCookie();
  const url = `${apiBaseUrl()}/api/private/restrita/graficos/estatisticaEntradas?periodoId=${periodoId}`;

  return fetchArray<tyEntradasGrafico>(url, token);
}

// Lista de grupos com despesas no período (combo)
export async function ListaDespesasPeriodo(
  periodoId: number | undefined
): Promise<tySelects[]> {
  if (!isPositiveInt(periodoId)) return [];

  const token = getTokenFromCookie();
  const url = `${apiBaseUrl()}/api/private/restrita/graficos/despesasPeriodo?periodoId=${periodoId}`;

  return fetchArray<tySelects>(url, token);
}

// Detalhe (subgrupos) do grupo selecionado
export async function ListaSubContasPorContas(
  periodoId: number | undefined,
  grupoId: number
): Promise<tySubGruposGrafico[]> {
  if (!isPositiveInt(periodoId)) return [];
  if (!Number.isInteger(grupoId) || grupoId <= 0) return [];

  const token = getTokenFromCookie();
  const url = `${apiBaseUrl()}/api/private/restrita/graficos/subContasPorContas?periodoId=${periodoId}&grupoId=${grupoId}`;

  return fetchArray<tySubGruposGrafico>(url, token);
}

// Somatórias por fonte no período (modo)
export async function RetSomatoriasPeriodo(
  periodoId: number | undefined,
  modo: string
): Promise<tySomatoriasPeriodo[]> {
  if (!isPositiveInt(periodoId)) return [];

  const token = getTokenFromCookie();
  const m = normalizeModo(modo);

  const url = `${apiBaseUrl()}/api/private/restrita/graficos/somatoriaPeriodo?periodoId=${periodoId}&modo=${encodeURIComponent(
    m
  )}`;

  return fetchArray<tySomatoriasPeriodo>(url, token);
}
