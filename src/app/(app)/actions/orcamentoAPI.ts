// src/app/(app)/actions/orcamentoAPI.ts

"use client";

import { getTokenFromCookie } from "@/lib/getToken";

/** Evitar any */
type JsonObject = Record<string, unknown>;

function getApiUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env");
  return v.replace(/\/$/, "");
}

function buildAuthHeaders(): Record<string, string> {
  const token = getTokenFromCookie();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
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

    const maybeError = obj.error;
    if (typeof maybeError === "string" && maybeError.trim()) return maybeError;

    const msg = obj.erro ?? obj.message;
    if (typeof msg === "string" && msg.trim()) return msg;

    // alguns handlers retornam { error: { message } }
    const errObj = obj.error;
    if (typeof errObj === "object" && errObj !== null) {
      const e = errObj as JsonObject;
      const m = e.message;
      if (typeof m === "string" && m.trim()) return m;
    }
  }
  return fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

/** Shape usado pela UI (tabela/form) */
export type OrcamentoRow = {
  orcamentoId: number;
  valor: number;
  nomeGrupo: string;
  tipoGrupo: string;
  grupoId: number;
  periodoId: number;
};

/**
 * Normaliza o retorno do Prisma (findMany include: { grupo: true })
 * Formatos esperados:
 *  - { id, valor, grupoId, periodoId, grupo: { nome, tipo } }
 *  - ou já no formato "achatado" { orcamentoId, nomeGrupo, tipoGrupo, ... }
 */
function normalizeRow(raw: unknown): OrcamentoRow | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as JsonObject;

  const orcamentoId = toNumber(r.orcamentoId ?? r.id, 0);
  const valor = toNumber(r.valor, 0);
  const grupoId = toNumber(r.grupoId, 0);
  const periodoId = toNumber(r.periodoId, 0);

  const grupo = r.grupo;
  const gObj = typeof grupo === "object" && grupo !== null ? (grupo as JsonObject) : null;

  const nomeGrupo =
    toString(r.nomeGrupo) ||
    (gObj ? toString(gObj.nome) : "") ||
    "";

  const tipoGrupo =
    toString(r.tipoGrupo) ||
    (gObj ? toString(gObj.tipo) : "") ||
    "";

  if (!Number.isFinite(orcamentoId) || orcamentoId <= 0) return null;
  if (!nomeGrupo.trim()) return null;

  return {
    orcamentoId: Math.trunc(orcamentoId),
    valor: Number.isFinite(valor) ? valor : 0,
    nomeGrupo: nomeGrupo.trim(),
    tipoGrupo,
    grupoId: Number.isFinite(grupoId) ? Math.trunc(grupoId) : 0,
    periodoId: Number.isFinite(periodoId) ? Math.trunc(periodoId) : 0,
  };
}

/**
 * GET /api/private/restrita/orcamento?periodoId=123
 * - Se não mandar periodoId, o backend retorna últimos 12 períodos (mas sua tela atual é por período).
 * - Admin pode consultar outro user via ?userId= (se você usar isso em algum lugar).
 */
export async function listarOrcamentos(periodoId: number, userId?: number): Promise<OrcamentoRow[]> {
  if (!Number.isFinite(periodoId) || periodoId <= 0) return [];

  const API_URL = getApiUrl();
  const url = new URL(`${API_URL}/api/private/restrita/orcamento`);
  url.searchParams.set("periodoId", String(Math.trunc(periodoId)));

  if (typeof userId === "number" && Number.isFinite(userId) && userId > 0) {
    url.searchParams.set("userId", String(Math.trunc(userId)));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { ...buildAuthHeaders() },
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));
  if (!Array.isArray(payload)) return [];

  const out: OrcamentoRow[] = [];
  for (const item of payload) {
    const row = normalizeRow(item);
    if (row) out.push(row);
  }

  return out;
}

/**
 * PATCH /api/private/restrita/orcamento/:id
 * Atualiza SOMENTE o valor do orçamento.
 */
export async function atualizarValorOrcamento(orcamentoId: number, valor: number): Promise<void> {
  if (!Number.isFinite(orcamentoId) || orcamentoId <= 0) throw new Error("orcamentoId inválido.");
  if (!Number.isFinite(valor)) throw new Error("valor inválido.");

  const API_URL = getApiUrl();
  const res = await fetch(
    `${API_URL}/api/private/restrita/orcamento/${Math.trunc(orcamentoId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
      body: JSON.stringify({ valor }),
      cache: "no-store",
    }
  );

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));
}

/**
 * POST /api/private/restrita/orcamento
 * Cria 1 orçamento (se você ainda precisar em algum lugar).
 * Body: { periodoId, grupoId, valor? }
 */
export async function criarOrcamentoUnico(input: {
  periodoId: number;
  grupoId: number;
  valor?: number;
}): Promise<{ orcamentoId: number }> {
  const { periodoId, grupoId, valor } = input;

  if (!Number.isFinite(periodoId) || periodoId <= 0) throw new Error("periodoId inválido.");
  if (!Number.isFinite(grupoId) || grupoId <= 0) throw new Error("grupoId inválido.");
  if (valor !== undefined && (!Number.isFinite(valor))) throw new Error("valor inválido.");

  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/orcamento`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      periodoId: Math.trunc(periodoId),
      grupoId: Math.trunc(grupoId),
      valor: valor ?? 0,
    }),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));

  // backend retorna { id, ... }
  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;
    const id = toNumber(obj.id ?? obj.orcamentoId, 0);
    if (id > 0) return { orcamentoId: Math.trunc(id) };
  }

  throw new Error("Resposta inesperada ao criar orçamento.");
}

/**
 * ✅ Endpoint NOVO (a criar no backend):
 * POST /api/private/restrita/orcamento/gerar
 * Body: { periodoId }
 * Cria orçamentos para TODOS os grupos ativos do período (valor 0),
 * respeitando 1x1 (não duplica).
 */
export async function gerarOrcamentos(periodoId: number): Promise<{ message?: string; adicionados?: number }> {
  if (!Number.isFinite(periodoId) || periodoId <= 0) throw new Error("periodoId inválido.");

  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/orcamento/gerar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ periodoId: Math.trunc(periodoId) }),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));

  const out: { message?: string; adicionados?: number } = {};
  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;
    const msg = obj.message;
    const add = obj.adicionados;

    if (typeof msg === "string") out.message = msg;
    if (typeof add === "number" && Number.isFinite(add)) out.adicionados = add;
    if (typeof add === "string") {
      const n = Number(add);
      if (Number.isFinite(n)) out.adicionados = n;
    }
  }
  return out;
}

/**
 * ✅ Endpoint NOVO (a criar no backend):
 * POST /api/private/restrita/orcamento/atualizar
 * Body: { periodoId }
 * Inclui SOMENTE grupos novos (valor 0) no período.
 */
export async function atualizarOrcamentos(periodoId: number): Promise<{ message?: string; adicionados?: number }> {
  if (!Number.isFinite(periodoId) || periodoId <= 0) throw new Error("periodoId inválido.");

  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/orcamento/atualizar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ periodoId: Math.trunc(periodoId) }),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));

  const out: { message?: string; adicionados?: number } = {};
  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;
    const msg = obj.message;
    const add = obj.adicionados;

    if (typeof msg === "string") out.message = msg;
    if (typeof add === "number" && Number.isFinite(add)) out.adicionados = add;
    if (typeof add === "string") {
      const n = Number(add);
      if (Number.isFinite(n)) out.adicionados = n;
    }
  }
  return out;
}

/**
 * ✅ Endpoint NOVO (a criar no backend):
 * GET /api/private/restrita/orcamento/grupos-ativos?periodoId=...
 * -> { total: number }
 * Usado pra habilitar/desabilitar botão "Atualizar Orçamentos".
 */
export async function contarGruposAtivos(periodoId: number): Promise<number> {
  if (!Number.isFinite(periodoId) || periodoId <= 0) return 0;

  const API_URL = getApiUrl();
  const url = new URL(`${API_URL}/api/private/restrita/orcamento/grupos-ativos`);
  url.searchParams.set("periodoId", String(Math.trunc(periodoId)));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { ...buildAuthHeaders() },
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));

  if (typeof payload === "object" && payload !== null) {
    const obj = payload as JsonObject;
    const total = toNumber(obj.total, 0);
    return Number.isFinite(total) ? Math.trunc(total) : 0;
  }

  return 0;
}
