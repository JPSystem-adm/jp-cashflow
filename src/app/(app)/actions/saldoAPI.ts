// src/app/(app)/actions/saldoAPI.ts
"use client";

import { getTokenFromCookie } from "@/lib/getToken";

/** Evitar any */
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

    const maybeError = obj.error;
    if (typeof maybeError === "object" && maybeError !== null) {
      const eobj = maybeError as JsonObject;
      const msg = eobj.message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }

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

/** "Janeiro/2026" -> "01/2026" (pro endpoint /saldo/gerar) */
const MESES: Record<string, string> = {
  Janeiro: "01",
  Fevereiro: "02",
  Março: "03",
  Marco: "03",
  Abril: "04",
  Maio: "05",
  Junho: "06",
  Julho: "07",
  Agosto: "08",
  Setembro: "09",
  Outubro: "10",
  Novembro: "11",
  Dezembro: "12",
};

export function periodoNomeToMMYYYY(periodoNome: string): string {
  const parts = periodoNome.split("/");
  if (parts.length !== 2) throw new Error("Período inválido (esperado Mês/Ano).");
  const mesNome = parts[0]?.trim();
  const ano = parts[1]?.trim();

  if (!mesNome || !ano) throw new Error("Período inválido (esperado Mês/Ano).");

  const mesSemAcento = mesNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const mesNum = MESES[mesNome] ?? MESES[mesSemAcento];
  if (!mesNum) throw new Error(`Mês inválido: ${mesNome}`);

  if (!/^\d{4}$/.test(ano)) throw new Error("Ano inválido no período.");

  return `${mesNum}/${ano}`;
}

/**
 * Linhas que a tela de saldos usa (tua tabela).
 */
export type tySomatoriasPeriodo = {
  FonteId: number;
  Fonte: string;
  Tipo: string;
  saldoId: number;       // pode ser 0 se API devolver algo sem saldo (mas no contrato novo /lista sempre tem saldo)
  valorInicial: number;  // valor do Saldo (inicial)
  valorPeriodo: number;  // movimentos do período (opcional)
  saldoAtual: number;    // inicial + movimentos
};

function normalizeRow(raw: unknown): tySomatoriasPeriodo | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as JsonObject;

  // Contrato NOVO do /saldo/lista:
  // { FonteId, Fonte, Tipo, saldoId, valorInicial, valorPeriodo, saldoAtual }
  const FonteId = toNumber(r.FonteId, NaN) || toNumber(r.fonteId, NaN);
  const Fonte = toString(r.Fonte) || toString(r.nomeFonte) || toString(r.fonte);
  const Tipo = toString(r.Tipo) || toString(r.tipoFonte) || toString(r.tipo);

  // saldoId pode existir, mas NÃO vamos matar a linha se vier 0
  const saldoId = toNumber(r.saldoId, 0);

  const valorInicial =
    toNumber(r.valorInicial, NaN) ||
    toNumber(r.saldoInicial, NaN) ||
    toNumber(r.valor, 0);

  // movimentos: no contrato novo vem "valorPeriodo", mas aceitamos "movLiquido/entradasFonteD"
  const movLiquido = toNumber(r.movLiquido, 0);
  const entradasFonteD = toNumber(r.entradasFonteD, 0);

  const valorPeriodo =
    toNumber(r.valorPeriodo, NaN) ||
    (movLiquido + entradasFonteD);

  const saldoAtual =
    toNumber(r.saldoAtual, NaN) ||
    (Number.isFinite(valorInicial) ? valorInicial : 0) +
      (Number.isFinite(valorPeriodo) ? valorPeriodo : 0);

  if (!Number.isFinite(FonteId) || FonteId <= 0) return null;

  return {
    FonteId: Math.trunc(FonteId),
    Fonte: Fonte,
    Tipo: Tipo,
    saldoId: Number.isFinite(saldoId) ? Math.trunc(saldoId) : 0,
    valorInicial: Number.isFinite(valorInicial) ? valorInicial : 0,
    valorPeriodo: Number.isFinite(valorPeriodo) ? valorPeriodo : 0,
    saldoAtual: Number.isFinite(saldoAtual) ? saldoAtual : 0,
  };
}

/**
 * GET /saldo/lista?periodoId=...
 * Agora a API retorna no contrato certo.
 */
export async function listarSaldos(periodoId: number): Promise<tySomatoriasPeriodo[]> {
  if (!Number.isFinite(periodoId) || periodoId <= 0) return [];

  const API_URL = getApiUrl();
  const res = await fetch(
    `${API_URL}/api/private/restrita/saldo/lista?periodoId=${periodoId}`,
    {
      method: "GET",
      headers: { ...buildAuthHeaders() },
      cache: "no-store",
    }
  );

  const payload = await readJsonSafe(res);

  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));
  if (!Array.isArray(payload)) return [];

  const out: tySomatoriasPeriodo[] = [];
  for (const item of payload) {
    const row = normalizeRow(item);
    if (row) out.push(row);
  }
  return out;
}

/**
 * POST /saldo/gerar
 * Envia MM/YYYY (a API converte pra "Mês/Ano" internamente).
 */
export async function gerarSaldos(periodoNome: string): Promise<{ message?: string }> {
  const API_URL = getApiUrl();
  const periodoMMYYYY = periodoNomeToMMYYYY(periodoNome);

  const res = await fetch(`${API_URL}/api/private/restrita/saldo/gerar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ periodo: periodoMMYYYY }),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));

  if (typeof payload === "object" && payload !== null) {
    const msg = (payload as JsonObject).message;
    if (typeof msg === "string") return { message: msg };
  }
  return {};
}

/**
 * POST /saldo/atualizar
 * Agora o endpoint lê do body.
 */
export async function atualizarSaldos(
  periodoId: number
): Promise<{ message?: string; adicionados?: number }> {
  if (!Number.isFinite(periodoId) || periodoId <= 0) {
    throw new Error("periodoId inválido.");
  }

  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/saldo/atualizar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ periodoId }),
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
 * PATCH /saldo/[id]
 * Atualiza valor inicial do saldo.
 */
export async function atualizarValorSaldo(saldoId: number, valor: number): Promise<void> {
  if (!Number.isFinite(saldoId) || saldoId <= 0) throw new Error("saldoId inválido.");
  if (!Number.isFinite(valor)) throw new Error("valor inválido.");

  const API_URL = getApiUrl();
  const res = await fetch(`${API_URL}/api/private/restrita/saldo/${saldoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ valor }),
    cache: "no-store",
  });

  const payload = await readJsonSafe(res);
  if (!res.ok) throw new Error(getErrorMessage(payload, res.statusText));
}
