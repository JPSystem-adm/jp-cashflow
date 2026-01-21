// src/app/(app)/actions/fonteAPI.ts

"use client";

import { getTokenFromCookie } from "@/lib/getToken";
import type { tyFonte } from "@/types/types";

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
    const inner = obj.dados ?? obj.data ?? obj.items ?? obj.fontes;
    if (Array.isArray(inner)) return inner as T[];
  }
  return [];
}

async function request<T>(input: string, init: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(input, init);
  const payload = await readJsonSafe(res);

  return {
    dados: payload as T,
    status: res.status,
    statusText: res.statusText,
  };
}

// ✅ GET /fonte
export async function listarFontes(): Promise<tyFonte[]> {
  const API_URL = getApiUrl();

  const { dados, status, statusText } = await request<unknown>(
    `${API_URL}/api/private/restrita/fonte`, {
    method: "GET",
    headers: buildAuthHeaders(),
    cache: "no-store",
  });

  if (status >= 300) {
    throw new Error(getErrorMessage(dados, statusText));
  }

  return extractArray<tyFonte>(dados);
}

// ✅ POST /fonte
export async function criarFonte(data: {
  nome: string;
  descricao?: string;
  tipo: "A" | "C" | "M";
  ativo?: boolean;
}): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/fonte`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      ...data,
      nome: data.nome.toUpperCase(),
    }),
  });
}

// ✅ PATCH /fonte/:id
export async function atualizarFonte(
  id: number,
  data: { nome?: string; descricao?: string; tipo?: "A" | "C" | "M"; ativo?: boolean }
): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  const payload = {
    ...data,
    ...(typeof data.nome === "string" ? { nome: data.nome.toUpperCase() } : {}),
  };

  return request<unknown>(`${API_URL}/api/private/restrita/fonte/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
}

// ✅ DELETE /fonte/:id
export async function excluirFonte(id: number): Promise<ApiResponse<unknown>> {
  const API_URL = getApiUrl();

  return request<unknown>(`${API_URL}/api/private/restrita/fonte/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });
}
