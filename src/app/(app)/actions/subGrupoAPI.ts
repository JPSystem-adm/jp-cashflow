//  src/app/(app)/actions/subGrupoAPI.ts

"use client";

import { getTokenFromCookie } from "@/lib/getToken";
import type { tySubGrupo } from "@/types/types";

type JsonObject = Record<string, unknown>;

export type ApiResponse<T> = {
  dados: T;
  status: number;
  statusText: string;
};

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

function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;
    const inner = obj.dados ?? obj.data ?? obj.items ?? obj.subgrupos;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

async function request<T>(input: string, init: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(input, init);
  const payload = await readJsonSafe(res);
  return { dados: payload as T, status: res.status, statusText: res.statusText };
}

/**
 * ============================================================
 *  ROTAS ANINHADAS (recomendado para tela de Grupo -> Subgrupos)
 *  GET  /api/private/restrita/grupo/[grupoId]  (vem grupo + subGrupos)
 *  POST /api/private/restrita/grupo/[grupoId]/subgrupos
 *  PATCH/DELETE /api/private/restrita/grupo/[grupoId]/subgrupos/[id]
 * ============================================================
 */

// ✅ Carregar subgrupos via GET do grupo (retorna grupo + subGrupos)
export async function listarSubGruposDoGrupo(grupoId: number): Promise<tySubGrupo[]> {
  const API_URL = getApiUrl();

  const { dados, status, statusText } = await request<unknown>(
    `${API_URL}/api/private/restrita/grupo/${grupoId}`,
    {
      method: "GET",
      headers: buildAuthHeaders(),
      cache: "no-store",
    }
  );

  if (status >= 300) throw new Error(getErrorMessage(dados, statusText));

  // resposta do endpoint pode vir como {grupo, subGrupos} ou {dados:{...}}
  if (typeof dados === "object" && dados !== null) {
    const obj = dados as JsonObject;
    const direct = obj.subGrupos;
    if (Array.isArray(direct)) return direct as tySubGrupo[];

    const inner = obj.dados;
    if (typeof inner === "object" && inner !== null) {
      const innerObj = inner as JsonObject;
      if (Array.isArray(innerObj.subGrupos)) return innerObj.subGrupos as tySubGrupo[];
    }
  }

  return [];
}

// ✅ Criar subgrupo dentro de um grupo
export async function criarSubGrupoNoGrupo(
  grupoId: number,
  data: { nome: string; descricao?: string }
): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/grupo/${grupoId}/subgrupos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    body: JSON.stringify(data),
  });
}

// ✅ Atualizar subgrupo via rota aninhada (permite mudar nome também, se seu backend aceitar)
export async function atualizarSubGrupoNoGrupo(
  grupoId: number,
  subGrupoId: number,
  data: { nome?: string; descricao?: string; ativo?: boolean }
): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(
    `${API_URL}/api/private/restrita/grupo/${grupoId}/subgrupos/${subGrupoId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
      body: JSON.stringify(data),
    }
  );
}

// ✅ Excluir subgrupo via rota aninhada (obs: sua doc diz que aqui não checa Lancamento)
export async function excluirSubGrupoNoGrupo(
  grupoId: number,
  subGrupoId: number
): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(
    `${API_URL}/api/private/restrita/grupo/${grupoId}/subgrupos/${subGrupoId}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(),
    }
  );
}

/**
 * ============================================================
 *  ROTAS PRÓPRIAS (úteis para DELETE com bloqueio por Lancamento)
 *  GET    /api/private/restrita/subgrupos?grupoId=...
 *  PATCH  /api/private/restrita/subgrupos/[id] (só descricao/ativo)
 *  DELETE /api/private/restrita/subgrupos/[id] (bloqueia se tiver Lancamento)
 * ============================================================
 */

export async function listarSubGrupos(grupoId?: number): Promise<tySubGrupo[]> {
  const API_URL = getApiUrl();
  const qs = typeof grupoId === "number" ? `?grupoId=${encodeURIComponent(String(grupoId))}` : "";

  const { dados, status, statusText } = await request<unknown>(
    `${API_URL}/api/private/restrita/subgrupos${qs}`,
    { method: "GET", headers: buildAuthHeaders(), cache: "no-store" }
  );

  if (status >= 300) throw new Error(getErrorMessage(dados, statusText));
  return extractArray<tySubGrupo>(dados);
}

// PATCH próprio: só descricao/ativo
export async function atualizarSubGrupo(
  subGrupoId: number,
  data: { descricao?: string; ativo?: boolean }
): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/subgrupos/${subGrupoId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders() },
    body: JSON.stringify(data),
  });
}

// DELETE próprio: checa Lancamento (melhor pra UX)
export async function excluirSubGrupo(subGrupoId: number): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/subgrupos/${subGrupoId}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
}
