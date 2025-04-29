// src/app/api/login/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
//import jwt from "jsonwebtoken";
import { generateToken } from "@/lib/jwt";

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto"; // define no .env.local

export async function POST(req: Request) {
    const { login, senha } = await req.json();
  
    // Valida se veio tudo
    if (!login || !senha) {
      return NextResponse.json({ error: "Login e senha são obrigatórios." }, { status: 400 });
    }
  
    // Chamada à API externa (api-cashflow)
    const response = await fetch(`${process.env.API_CASHFLOW_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, senha }),
    });
  
    if (!response.ok) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }
  
    const usuario = await response.json();

    // 🔥 Criamos o token JWT aqui!
    const token = generateToken({
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        perfil: usuario.perfil,
    });

    // Salva o token como cookie HttpOnly
    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hora
      path: "/",
    });
  
    return NextResponse.json({ ok: true });
  }