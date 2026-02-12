// src/lib/session.ts

"use client";

import { getTokenFromCookie } from "@/lib/getToken";

type Perfil = "admin" | "default" | "plus" | "premium";

export type SessionUser = {
  id: number;
  login: string;
  nome: string;
  perfil: Perfil;
  email?: string;
};

type MeResponse = { usuario: SessionUser };

function getApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definido.");
  return v;
}

export async function fetchMe(): Promise<SessionUser | null> {
  const token = getTokenFromCookie();
  if (!token) return null;

  const res = await fetch(`${getApiBaseUrl()}/api/private/restrita/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 404) return null;
  if (!res.ok) throw new Error(`Falha ao validar sessão (HTTP ${res.status})`);

  const data = (await res.json()) as MeResponse;
  return data.usuario ?? null;
}

export function clearAuthCookie() {
  // remove token
  document.cookie = "token=; path=/; max-age=0; samesite=lax";
}
