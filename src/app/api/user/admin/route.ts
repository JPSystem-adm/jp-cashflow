// src/app/api/user/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request){
  const dado = await req.json();
  try {
    const user = await prisma.user.update({
      where: {
        id: dado.id
      },
      data: {
        perfil: "admin",
        login: "JP"
      },
    });
    return NextResponse.json(
      {
        message: "OK",
        user
      },
      {
        status: 200,
      }
    );    
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error",
        error
      },
      {
        status: 500,
      }
    );    
  }
}