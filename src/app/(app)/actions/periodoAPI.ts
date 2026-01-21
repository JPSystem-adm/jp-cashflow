// src/app/(app)/actions/periodoAPI.ts

// "use client";

// import { getTokenFromCookie } from "@/lib/getToken";

// type JsonObject = Record<string, unknown>;

// function getApiUrl(): string {
//   const v = process.env.NEXT_PUBLIC_BASEURL_API;
//   if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env");
//   return v.replace(/\/$/, "");
// }

// async function readJsonSafe(res: Response): Promise<unknown> {
//   const text = await res.text();
//   if (!text) return null;
//   try {
//     return JSON.parse(text) as unknown;
//   } catch {
//     return { message: text } satisfies JsonObject;
//   }
// }

// function getErrorMessage(payload: unknown, fallback: string): string {
//   if (typeof payload === "object" && payload !== null) {
//     const obj = payload as JsonObject;
//     const msg = obj.erro ?? obj.message ?? obj.error;
//     if (typeof msg === "string" && msg.trim()) return msg;
//   }
//   return fallback;
// }

// function buildAuthHeaders(): Record<string, string> {
//   const token = getTokenFromCookie();
//   const headers: Record<string, string> = {};
//   if (token) headers.Authorization = `Bearer ${token}`;
//   return headers;
// }

// function extractPeriodoId(payload: unknown): number {
//   if (typeof payload === "object" && payload !== null) {
//     const obj = payload as JsonObject;
//     const id = obj.periodoId;
//     if (typeof id === "number" && Number.isFinite(id) && id > 0) return Math.trunc(id);
//   }
//   return 0;
// }

// /**
//  * ✅ Garante que o período exista e retorna o ID.
//  * Depende do endpoint:
//  * POST /api/private/restrita/periodo/ensure
//  */
// export async function ensurePeriodo(periodo: string): Promise<number> {
//   const API_URL = getApiUrl();

//   const res = await fetch(`${API_URL}/api/private/restrita/periodo/ensure`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...buildAuthHeaders(),
//     },
//     body: JSON.stringify({ periodo }),
//     cache: "no-store",
//   });

//   const payload = await readJsonSafe(res);

//   if (!res.ok) {
//     throw new Error(getErrorMessage(payload, res.statusText));
//   }

//   const periodoId = extractPeriodoId(payload);
//   if (periodoId <= 0) throw new Error("Resposta inválida: periodoId não retornado.");
//   return periodoId;
// }

// src/app/(app)/actions/periodoAPI.ts
"use client";

import { getTokenFromCookie } from "@/lib/getToken";

type JsonObject = Record<string, unknown>;

function getApiUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env");
  return v.replace(/\/$/, "");
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text } satisfies JsonObject;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;
    const msg = obj.erro ?? obj.message ?? obj.error;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

function buildAuthHeaders(): Record<string, string> {
  const token = getTokenFromCookie();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function extractPeriodoId(payload: unknown): number {
  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;

    // formatos possíveis:
    // { periodoId: number }
    // { id: number }
    // { data: { periodoId: number } } (não esperado, mas tolerado)
    const direct = obj.periodoId;
    if (typeof direct === "number" && Number.isFinite(direct) && direct > 0) {
      return Math.trunc(direct);
    }

    const id = obj.id;
    if (typeof id === "number" && Number.isFinite(id) && id > 0) {
      return Math.trunc(id);
    }

    const data = obj.data;
    if (typeof data === "object" && data !== null) {
      const dataObj = data as JsonObject;
      const nested = dataObj.periodoId;
      if (typeof nested === "number" && Number.isFinite(nested) && nested > 0) {
        return Math.trunc(nested);
      }
    }
  }
  return 0;
}

/**
 * Converte "Janeiro/2026" -> "01/2026"
 * Se já estiver no formato "MM/YYYY", retorna igual.
 */
export function mesAnoToMMYYYY(periodo: string): string {
  const s = periodo.trim();

  // já é MM/YYYY?
  if (/^\d{2}\/\d{4}$/.test(s)) return s;

  // formato esperado: "Janeiro/2026"
  const [mesNomeRaw, anoRaw] = s.split("/");
  const mesNome = (mesNomeRaw ?? "").trim();
  const ano = Number((anoRaw ?? "").trim());

  const mapa: Record<string, number> = {
    Janeiro: 1,
    Fevereiro: 2,
    Março: 3,
    Marco: 3, // tolerância sem acento
    Abril: 4,
    Maio: 5,
    Junho: 6,
    Julho: 7,
    Agosto: 8,
    Setembro: 9,
    Outubro: 10,
    Novembro: 11,
    Dezembro: 12,
  };

  const mes = mapa[mesNome] ?? 0;
  if (!mes || !Number.isFinite(ano) || ano < 1900) return s;

  return `${String(mes).padStart(2, "0")}/${ano}`;
}

/**
 * ✅ Garante que o período exista e retorna o ID.
 * Endpoint principal:
 * POST /api/private/restrita/periodo/ensure  (recomendado)
 *
 * Compatibilidade:
 * Se o endpoint /ensure não existir, tenta:
 * POST /api/private/restrita/periodo/retIdPeriodo (apenas retorna id, não cria)
 * e, se não existir, levanta erro.
 */
export async function ensurePeriodo(periodo: string): Promise<number> {
  const API_URL = getApiUrl();

  // Mantém o comportamento atual: manda exatamente o que recebeu.
  // Se você quiser passar "Janeiro/2026" e a API aceitar, ótimo.
  // Se sua API exigir "MM/YYYY", use ensurePeriodoFromMesAno() (abaixo).
  const res = await fetch(`${API_URL}/api/private/restrita/periodo/ensure`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ periodo }),
    cache: "no-store",
  });

  // Se o endpoint não existir (404), tenta o antigo para não quebrar nada
  if (res.status === 404) {
    // tenta buscar id via endpoint legado
    const legacyId = await getPeriodoId(periodo);
    if (legacyId > 0) return legacyId;

    // se não achou, aí sim estoura (porque o /ensure realmente não existe)
    throw new Error(
      "Endpoint /periodo/ensure não encontrado e o período não existe (retIdPeriodo não retornou id)."
    );
  }

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, res.statusText));
  }

  const periodoId = extractPeriodoId(payload);
  if (periodoId <= 0) throw new Error("Resposta inválida: periodoId não retornado.");
  return periodoId;
}

/**
 * Busca apenas o ID (não cria).
 * Endpoint:
 * POST /api/private/restrita/periodo/retIdPeriodo
 */
export async function getPeriodoId(periodo: string): Promise<number> {
  const API_URL = getApiUrl();

  const res = await fetch(`${API_URL}/api/private/restrita/periodo/retIdPeriodo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ periodo }),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    // não explode aqui pra permitir uso como "tentativa"
    return 0;
  }

  const periodoId = extractPeriodoId(payload);
  return periodoId > 0 ? periodoId : 0;
}

/**
 * Tenta obter o ID; se não existir, cria usando ensurePeriodo.
 * (Útil quando você quer "garantir", mas prefere tentar o caminho barato primeiro.)
 */
export async function ensurePeriodoId(periodo: string): Promise<number> {
  const id = await getPeriodoId(periodo);
  if (id > 0) return id;
  return ensurePeriodo(periodo);
}

/**
 * Versão "amigável" para telas que trabalham com "Janeiro/2026"
 * Converte para "MM/YYYY" e garante o período.
 *
 * Use esta quando sua API de período trabalhar com MM/YYYY.
 */
export async function ensurePeriodoFromMesAno(mesAno: string): Promise<number> {
  const mmYYYY = mesAnoToMMYYYY(mesAno);
  return ensurePeriodoId(mmYYYY);
}
