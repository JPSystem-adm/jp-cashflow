'use server'

import nodemailer from "nodemailer";

const email = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: email,
    pass: pass,
  },
});

export async function enviarEmail(body: {para: string, assunto: string, corpoTexto: string, corpoHtml: string}) {

  let enviado = false;
  
  try {
    
    const info = await transporter.sendMail({
      from: '"JP-CashFlow " <jpsystem@gmail.com>',
      to: body.para, 
      subject: `${body.assunto}`, 
      text: body.corpoTexto, 
      html: body.corpoHtml 
    });
  
    enviado = true;
  } catch (error: any) {
    throw Error(error.message);
  }
  return enviado;
}