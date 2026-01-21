// src/app/(app)/actions/grupoAPI.ts

"use client";

import { getTokenFromCookie } from "@/lib/getToken";
import type { tyGrupo, tyGrupoLista } from "@/types/types";

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
  // Tenta ler como texto primeiro para evitar crash quando não for JSON
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    // Pode ser HTML (erro 502 etc.) ou texto simples
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
    const inner = obj.dados ?? obj.data ?? obj.items;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

function extractObject<T>(payload: unknown): T {
  if (typeof payload === "object" && payload !== null && !Array.isArray(payload)) {
    const obj = payload as JsonObject;
    const inner = obj.dados ?? obj.data ?? obj.item;

    if (typeof inner === "object" && inner !== null && !Array.isArray(inner)) {
      return inner as T;
    }

    return obj as T;
  }

  // Se vier array/primitive, retorna objeto vazio tipado
  return {} as T;
}

async function request<T>(
  input: string,
  init: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(input, init);
  const payload = await readJsonSafe(res);

  // Aqui NÃO damos throw: devolvemos status + dados
  // O front decide se trata 401/409 etc.
  return {
    dados: payload as T,
    status: res.status,
    statusText: res.statusText,
  };
}

// ✅ Listar todos os grupos do usuário autenticado
export async function listarGrupos(): Promise<tyGrupoLista[]> {
  const API_URL = getApiUrl();

  const { dados, status, statusText } = await request<unknown>(
    `${API_URL}/api/private/restrita/grupo`,
    {
      method: "GET",
      headers: buildAuthHeaders(),
      cache: "no-store",
    }
  );

  if (status >= 300) {
    throw new Error(getErrorMessage(dados, statusText));
  }

  return extractArray<tyGrupoLista>(dados);
}

// ✅ Buscar dados de um grupo específico (com subgrupos)
export async function buscarGrupo(id: number): Promise<tyGrupo> {
  const API_URL = getApiUrl();

  const { dados, status, statusText } = await request<unknown>(
    `${API_URL}/api/private/restrita/grupo/${id}`,
    {
      method: "GET",
      headers: buildAuthHeaders(),
      cache: "no-store",
    }
  );

  if (status >= 300) {
    throw new Error(getErrorMessage(dados, statusText));
  }

  return extractObject<tyGrupo>(dados);
}

// ✅ Criar novo grupo com subgrupos
export async function criarGrupo(data: {
  nome: string;
  descricao?: string;
  tipo?: "C" | "D" | "M";
  ativo?: boolean;
  subGrupos?: { nome: string; descricao?: string }[];
}): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/grupo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
}

// ✅ Atualizar dados do grupo (PADRONIZADO com status)
export async function atualizarGrupo(
  id: number,
  data: { nome?: string; descricao?: string; tipo?: "C" | "D" | "M"; ativo?: boolean }
): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/grupo/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
}

// ✅ Excluir grupo (PADRONIZADO com status)
export async function excluirGrupo(id: number): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/grupo/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
}
