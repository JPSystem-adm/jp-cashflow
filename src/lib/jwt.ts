import jwt from "jsonwebtoken";
import { DecodedToken } from "@/types/next-auth";

const SECRET_KEY = process.env.JWT_SECRET || "minha_chave_super_secreta";

// Mapeia os tempos para facilitar a conversão
const EXPIRATION_MAP: Record<string, number> = {
  "1h": 3600,
  "1d": 86400,
  "1w": 604800,
  "1m": 2592000,
};

export function generateToken(payload: object, expiresIn: string = "1d") {
  const expirationTime = EXPIRATION_MAP[expiresIn] || parseInt(expiresIn, 10);
  if (isNaN(expirationTime)) {
    throw new Error(`Valor inválido para expiresIn: ${expiresIn}`);
  }

  return jwt.sign(payload, SECRET_KEY, { expiresIn: expirationTime });
  //Vou deixar sem expiração para os testes do sistema depois retono a expiração
  //return jwt.sign(payload, SECRET_KEY);
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, SECRET_KEY) as DecodedToken;
  } catch (error) {
    console.error("Erro ao verificar o token:", error);
    return null;
  }
}
