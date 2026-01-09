// src/app/(app)/actions/grupoAPI.ts

"use client";

import { getTokenFromCookie } from "@/lib/getToken";
import type { tyGrupo, tyGrupoLista } from "@/types/types";

type JsonObject = Record<string, unknown>;

function getApiUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env.local");
  return v.replace(/\/$/, "");
}

async function readJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
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
  return {} as T;
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

// ✅ Listar todos os grupos do usuário autenticado
export async function listarGrupos(): Promise<tyGrupoLista[]> {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/grupo`, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, res.statusText));
  }

  return extractArray<tyGrupoLista>(payload);
}

// ✅ Buscar dados de um grupo específico (com subgrupos)
export async function buscarGrupo(id: number): Promise<tyGrupo> {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/grupo/${id}`, {
    headers: buildAuthHeaders(),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) {
    throw new Error(getErrorMessage(payload, res.statusText));
  }

  return extractObject<tyGrupo>(payload);
}

// ✅ Criar novo grupo com subgrupos
export async function criarGrupo(data: {
  nome: string;
  descricao?: string;
  tipo?: "C" | "D" | "M";
  ativo?: boolean;
  subGrupos?: { nome: string; descricao?: string }[];
}): Promise<{ dados: unknown; status: number; statusText: string }> {
  const API_URL = getApiUrl();
  const auth = buildAuthHeaders();

  const res = await fetch(`${API_URL}/api/private/restrita/grupo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...auth,
    },
    body: JSON.stringify(data),
  });

  const payload = await readJsonSafe(res);

  return { dados: payload, status: res.status, statusText: res.statusText };
}

// ✅ Atualizar dados do grupo
export async function atualizarGrupo(
  id: number,
  data: { nome?: string; descricao?: string; tipo?: "C" | "D" | "M"; ativo?: boolean }
): Promise<unknown> {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/grupo/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));
  return payload;
}

// ✅ Excluir grupo
export async function excluirGrupo(id: number): Promise<unknown> {
  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/grupo/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  const payload = await readJsonSafe(res);

  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));
  return payload;
}
