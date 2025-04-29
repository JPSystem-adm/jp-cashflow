// src/lib/decodeToken.ts


/**
 * Decodifica o token JWT sem verificar assinatura.
 * Útil para ler dados no frontend (não usar para validação de segurança).
 */
export function decodeToken(token: string): {
  id: number;
  login: string;
  nome: string;
  perfil: string;
} | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    return null;
  }
}
