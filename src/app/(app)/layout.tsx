// src/app/(app)/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientDrawer from "./_components/ClientDrawer"; // Importando o Client Component

// COMPONENTES E PROVIDERS
//==========================================================
import {Query2ClientProvider} from "@/lib/queryProvider";
import queryClient from "@/lib/reactQuery";
import { GlobalProvider } from "./contextGlobal";
import Cabecalho from "./cabecalho/cabecalho";
import Rodape from "./rodape/rodape";

//import AuthProvider from "@/components/providers/auth-provider"; // Este pode ser mantido se for controle custom
//==========================================================

// FONTE
const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "JP Cash Flow",
  description: "Para suas necessidades financeiras",
};

export default async function RootLayout({
  children, userId
}: Readonly<{ children: React.ReactNode, userId: string | undefined}>) {

  console.log("Entrou no layout Raiz da seção APP")

  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="saldo.png"/>
      </head>
      <body className={`${inter.className} flex flex-col h-screen`}>
        {/* <AuthProvider> */}
          <Query2ClientProvider client={queryClient}>
            <GlobalProvider userId={ userId ? Number(userId): 0}>
              <Cabecalho/>
              {/* ===== Parte central ===== */}
              <div className="flex flex-col flex-grow w-auto pt-14 pb-4">
                <ClientDrawer />
                <div className="flex flex-col flex-grow items-center h-auto w-auto pr-8 pl-8 pt-2 pb-2 bg-white  overflow-x-auto">
                  {children}
                </div>
              </div>
              {/* ======================== */}
              <Rodape/>
            </GlobalProvider>
          </Query2ClientProvider>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
