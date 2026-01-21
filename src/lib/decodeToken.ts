// src/lib/decodeToken.ts

export type DecodedJwtPayload = {
  id: number;
  login: string;
  nome: string;
  perfil: string;
  iat?: number;
  exp?: number;
};

function base64UrlToBase64(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return padded + "=".repeat(padLength);
}

export function decodeToken(token: string): DecodedJwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = parts[1];
    const json = atob(base64UrlToBase64(payload));
    const parsed: unknown = JSON.parse(json);

    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;

    const id = obj.id;
    const login = obj.login;
    const nome = obj.nome;
    const perfil = obj.perfil;

    if (typeof id !== "number") return null;
    if (typeof login !== "string") return null;
    if (typeof nome !== "string") return null;
    if (typeof perfil !== "string") return null;

    const iat = typeof obj.iat === "number" ? obj.iat : undefined;
    const exp = typeof obj.exp === "number" ? obj.exp : undefined;

    return { id, login, nome, perfil, iat, exp };
  } catch {
    return null;
  }
}
