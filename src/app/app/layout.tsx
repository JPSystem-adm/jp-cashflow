import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { auth as authOptions } from "@/lib/auth-config";
import AuthProvider from "@/components/providers/auth-provider";
import ClientDrawer from "./_components/ClientDrawer"; // Importando o Client Component

//==========================================================
import {Query2ClientProvider} from "@/lib/queryProvider";
import queryClient from "@/lib/reactQuery";
import { GlobalProvider } from "./contextGlobal";
import Cabecalho from "./cabecalho/cabecalho";
import Rodape from "./rodape/rodape";
//==========================================================

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JP Cash Flow",
  description: "Para suas necessidades financeiras",
  
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="saldo.png"></link>
      </head>
      <body className={`${inter.className} flex flex-col h-screen`}>
        <AuthProvider>
          <Query2ClientProvider client={queryClient}>
            <GlobalProvider userId={session?.user.id}>
              <Cabecalho/>
              {/* ===== Parte central ===== */}
              <div className="flex flex-col flex-grow w-auto pt-14 pb-4">
                {session && <ClientDrawer />}
                <div className="flex flex-col flex-grow items-center h-auto w-auto pr-8 pl-8 pt-2 pb-2 bg-white  overflow-x-auto">
                  {children}
                </div>
              </div>
              {/* ======================== */}
              <Rodape/>
            </GlobalProvider>
          </Query2ClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
