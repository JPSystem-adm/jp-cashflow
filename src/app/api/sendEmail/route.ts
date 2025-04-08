import { NextRequest, NextResponse } from 'next/server';
import { enviarEmail } from '@/app/app/actions/enviaEmail';

export async function POST(req: NextRequest) {
  const { para, assunto, corpoTexto, corpoHtml } = await req.json();

  try {
    const result = await enviarEmail({ para, assunto, corpoTexto, corpoHtml });
    return NextResponse.json({ message: 'Email sent successfully', result });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error sending email', error: error.message }, { status: 500 });
  }
}
