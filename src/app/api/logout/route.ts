// src/app/api/logout/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Deleta o cookie chamado 'token'
  cookies().set("token", "", {
    httpOnly: true,
    expires: new Date(0), // força expiração
    path: "/",
  });

  return NextResponse.json({ ok: true, message: "Logout realizado com sucesso" });
}