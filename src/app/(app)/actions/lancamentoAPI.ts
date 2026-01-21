// src/app/(app)/actions/lancamentoAPI.ts
import type { tyLancamento, tyResult } from "@/types/types";
import { getTokenFromCookie } from "@/lib/getToken";

/** Tipos da tela/API */
export type OperacaoLancamento = "M" | "T"; // M = Movimentação (inclui D/C), T = Transferência

export type CriarLancamentoInput = {
  valor: number;
  dtLancamento: string; // ISO string
  descricao: string;
  periodoId: number;
  subGrupoId: number;
  fonteId: number;
  operacao: OperacaoLancamento;
  fonteIdD?: number | null;
};

export type GrupoTipoApi = "D" | "C" | "M";

export type GrupoApi = {
  id?: number;
  nome: string;
  descricao?: string | null;
  tipo?: GrupoTipoApi;
  tipoDesc?: string;
  qtdSubGrupos?: number;
  ativo: boolean;
};

export type SubGrupoApi = {
  id: number;
  nome: string;
  descricao?: string | null;
  ativo?: boolean;
  grupoId: number;
};

export type FonteApi = {
  id: number;
  nome: string;
  descricao?: string | null;
  tipo?: string;
  ativo?: boolean;
  userId?: number;
};

type ApiErrorShape = {
  error?: { message?: string } | string;
  message?: string;
  erro?: string;
};

function getApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env");
  return v.replace(/\/$/, "");
}

function pickApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Erro inesperado no servidor.";
  const d = data as ApiErrorShape;

  if (typeof d.error === "string") return d.error;
  if (d.error && typeof d.error === "object" && typeof d.error.message === "string") return d.error.message;

  return d.message || d.erro || "Erro inesperado no servidor.";
}

function isPositiveInt(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0 && Number.isInteger(n);
}

function isPositiveNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

function isISODateString(v: unknown): v is string {
  return typeof v === "string" && !Number.isNaN(Date.parse(v));
}

function normalizeOperacao(op: unknown): OperacaoLancamento {
  // Backend antigo podia trazer "D" ou "C". Você disse: D/C == M.
  if (op === "T") return "T";
  return "M";
}

/** =========================
 *  Lançamentos (CRUD)
 *  ========================= */

export async function listarLancamentos(params: {
  periodoId: number;
  grupoId?: number;
  subGrupoId?: number;
  fonteId?: number;
}): Promise<tyLancamento[]> {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Token não encontrado. Faça login novamente.");

  const { periodoId, grupoId, subGrupoId, fonteId } = params;

  if (!isPositiveInt(periodoId)) throw new Error("periodoId inválido.");

  const url = new URL(`${getApiBaseUrl()}/api/private/restrita/lancamentos`);
  url.searchParams.set("periodoId", String(periodoId));
  if (grupoId && isPositiveInt(grupoId)) url.searchParams.set("grupoId", String(grupoId));
  if (subGrupoId && isPositiveInt(subGrupoId)) url.searchParams.set("subGrupoId", String(subGrupoId));
  if (fonteId && isPositiveInt(fonteId)) url.searchParams.set("fonteId", String(fonteId));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error(pickApiErrorMessage(data));

  if (!Array.isArray(data)) return [];

  // Garante operacao tipada (M/T) no retorno
  return data.map((l) => {
    if (!l || typeof l !== "object") return {} as tyLancamento;
    const obj = l as Record<string, unknown>;

    const operacao = normalizeOperacao(obj.operacao);

    return {
      ...(l as tyLancamento),
      operacao,
    };
  });
}

export async function CriarLancamento(input: CriarLancamentoInput): Promise<{ ok: true; message: string }> {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Token não encontrado. Faça login novamente.");

  if (!isPositiveNumber(input.valor)) throw new Error("Valor inválido.");
  if (!isISODateString(input.dtLancamento)) throw new Error("Data do lançamento inválida.");
  if (!input.descricao || input.descricao.trim().length === 0) throw new Error("Descrição é obrigatória.");
  if (!isPositiveInt(input.periodoId)) throw new Error("periodoId inválido.");
  if (!isPositiveInt(input.subGrupoId)) throw new Error("subGrupoId inválido.");
  if (!isPositiveInt(input.fonteId)) throw new Error("fonteId inválido.");

  if (input.operacao === "T") {
    if (!input.fonteIdD || !isPositiveInt(input.fonteIdD)) {
      throw new Error("Para Transferência (T), a Fonte Destino (fonteIdD) é obrigatória.");
    }
    if (input.fonteIdD === input.fonteId) {
      throw new Error("Fonte de origem e destino não podem ser iguais.");
    }
  }

  const payload: {
    valor: number;
    dtLancamento: string;
    operacao: OperacaoLancamento;
    subGrupoId: number;
    fonteId: number;
    periodoId: number;
    descricao: string;
    fonteIdD?: number | null;
  } = {
    valor: input.valor,
    dtLancamento: input.dtLancamento,
    operacao: input.operacao,
    subGrupoId: input.subGrupoId,
    fonteId: input.fonteId,
    periodoId: input.periodoId,
    descricao: input.descricao,
  };

  if (input.operacao === "T") payload.fonteIdD = input.fonteIdD ?? null;

  const res = await fetch(`${getApiBaseUrl()}/api/private/restrita/lancamentos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error(pickApiErrorMessage(data));

  const message =
    data && typeof data === "object" && "message" in data && typeof (data as { message?: unknown }).message === "string"
      ? (data as { message: string }).message
      : "Lançamento criado com sucesso!";

  return { ok: true, message };
}

/**
 * Adapter para manter compatibilidade com sua tela antiga que espera tyResult e recebe tyLancamento.
 * Assim você não quebra WarningBox nem fluxo existente.
 */
export async function CriarLancamentoResult(dados: tyLancamento): Promise<tyResult> {
  try {
    if (typeof dados.valor !== "number" || !Number.isFinite(dados.valor) || dados.valor <= 0) {
      return { status: "Erro", menssagem: "Valor inválido." };
    }
    if (!dados.dtLancamento || !isISODateString(dados.dtLancamento)) {
      return { status: "Erro", menssagem: "Data inválida." };
    }
    if (!dados.descricao || dados.descricao.trim().length === 0) {
      return { status: "Erro", menssagem: "Descrição é obrigatória." };
    }
    if (!isPositiveInt(dados.periodoId)) {
      return { status: "Erro", menssagem: "Período inválido." };
    }
    if (!isPositiveInt(dados.subGrupoId)) {
      return { status: "Erro", menssagem: "Sub-Conta inválida." };
    }
    if (!isPositiveInt(dados.fonteId)) {
      return { status: "Erro", menssagem: "Fonte inválida." };
    }

    const operacao = normalizeOperacao(dados.operacao);
    const fonteIdD =
      typeof dados.fonteIdD === "number" && Number.isFinite(dados.fonteIdD) ? dados.fonteIdD : null;

    if (operacao === "T" && (!fonteIdD || fonteIdD <= 0)) {
      return { status: "Erro", menssagem: "Para Transferência (T), selecione a Fonte Destino." };
    }

    const input: CriarLancamentoInput = {
      valor: dados.valor,
      dtLancamento: dados.dtLancamento,
      descricao: dados.descricao,
      periodoId: dados.periodoId,
      subGrupoId: dados.subGrupoId,
      fonteId: dados.fonteId,
      operacao,
      fonteIdD: operacao === "T" ? fonteIdD : null,
    };

    const res = await CriarLancamento(input);
    return { status: "Sucesso", menssagem: res.message };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { status: "Erro", menssagem: msg };
  }
}

export async function excluirLancamento(lancamentoId: number): Promise<tyResult> {
  const token = getTokenFromCookie();
  if (!token) return { status: "Erro", menssagem: "Token não encontrado." };

  if (!isPositiveInt(lancamentoId)) return { status: "Erro", menssagem: "ID inválido." };

  const res = await fetch(`${getApiBaseUrl()}/api/private/restrita/lancamentos/${lancamentoId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) return { status: "Erro", menssagem: pickApiErrorMessage(data) };

  return { status: "Sucesso", menssagem: "Lançamento excluído com sucesso!" };
}

/** =========================
 *  Operação do Grupo
 *  =========================
 *  Endpoint: /api/private/restrita/grupo/{grupoId}/operacao  (como você já usa)
 *  Backend retorna { tipo: "D" | "C" | "T" | "M" }
 *  Regra: D/C => M
 */
export async function RetOperacao(grupoId: number): Promise<OperacaoLancamento | null> {
  const token = getTokenFromCookie();
  if (!token) return null;

  if (!isPositiveInt(grupoId)) return null;

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/private/restrita/grupo/${grupoId}/operacao`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data: unknown = await res.json().catch(() => null);
    const tipo = data && typeof data === "object" && "tipo" in data ? (data as { tipo?: unknown }).tipo : null;

    // D/C == M
    return normalizeOperacao(tipo);
  } catch (error) {
    console.error("Erro ao buscar operação:", error);
    return null;
  }
}

/** =========================
 *  Listas para combos (sem selectActions.ts)
 *  ========================= */

export async function listarGruposAtivos(): Promise<GrupoApi[]> {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Token não encontrado.");

  const res = await fetch(`${getApiBaseUrl()}/api/private/restrita/grupo`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error(pickApiErrorMessage(data));

  if (!Array.isArray(data)) return [];

  // filtra ativo=true (regra do combo)
  return (data as GrupoApi[]).filter((g) => Boolean(g.ativo));
}

export async function listarSubGruposPorGrupo(grupoId: number): Promise<SubGrupoApi[]> {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Token não encontrado.");

  // Se grupoId for 0, não lista (pra sua regra: só habilita após escolher grupo)
  if (!isPositiveInt(grupoId)) return [];

  const url = new URL(`${getApiBaseUrl()}/api/private/restrita/subgrupos`);
  url.searchParams.set("grupoId", String(grupoId));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error(pickApiErrorMessage(data));

  // backend retorna { subgrupos: [...] }
  const subgrupos =
    data && typeof data === "object" && "subgrupos" in data && Array.isArray((data as { subgrupos?: unknown }).subgrupos)
      ? ((data as { subgrupos: SubGrupoApi[] }).subgrupos ?? [])
      : [];

  return subgrupos;
}

export async function listarFontesAtivas(): Promise<FonteApi[]> {
  const token = getTokenFromCookie();
  if (!token) throw new Error("Token não encontrado.");

  const res = await fetch(`${getApiBaseUrl()}/api/private/restrita/fonte`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new Error(pickApiErrorMessage(data));

  if (!Array.isArray(data)) return [];

  // filtra ativo=true (regra do combo)
  return (data as FonteApi[]).filter((f) => f.ativo !== false);
}

export type EditarLancamentoInput = {
  lancamentoId: number;
  valor: number;
  dtLancamento: string; // ISO
  descricao: string;
  subGrupoId: number;
  fonteId: number;
  fonteIdD?: number | null;
};

export async function editarLancamento(input: EditarLancamentoInput): Promise<tyResult> {
  const token = getTokenFromCookie();
  if (!token) return { status: "Erro", menssagem: "Token não encontrado." };

  if (!isPositiveInt(input.lancamentoId)) return { status: "Erro", menssagem: "ID inválido." };
  if (!isPositiveNumber(input.valor)) return { status: "Erro", menssagem: "Valor inválido." };
  if (!isISODateString(input.dtLancamento)) return { status: "Erro", menssagem: "Data inválida." };
  if (!input.descricao || input.descricao.trim().length === 0) return { status: "Erro", menssagem: "Descrição é obrigatória." };
  if (!isPositiveInt(input.subGrupoId)) return { status: "Erro", menssagem: "Sub-Conta inválida." };
  if (!isPositiveInt(input.fonteId)) return { status: "Erro", menssagem: "Fonte inválida." };

  // regra de transferência: fonteIdD opcional aqui porque a operação pode ser M.
  // Mas se vier fonteIdD (transferência), valida:
  if (input.fonteIdD !== undefined && input.fonteIdD !== null) {
    if (!isPositiveInt(input.fonteIdD)) return { status: "Erro", menssagem: "Fonte de destino inválida." };
    if (input.fonteIdD === input.fonteId) return { status: "Erro", menssagem: "Origem e destino não podem ser iguais." };
  }

  const res = await fetch(`${getApiBaseUrl()}/api/private/restrita/lancamentos/${input.lancamentoId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      descricao: input.descricao,
      valor: input.valor,
      subGrupoId: input.subGrupoId,
      dtLancamento: input.dtLancamento,
      fonteId: input.fonteId,
      fonteIdD: input.fonteIdD ?? null,
    }),
  });

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) return { status: "Erro", menssagem: pickApiErrorMessage(data) };

  return { status: "Sucesso", menssagem: "Lançamento alterado com sucesso!" };
}
