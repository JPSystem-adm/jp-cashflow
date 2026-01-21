// src/app/(app)/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientDrawer from "./_components/ClientDrawer";

// PROVIDERS / COMPONENTES
import { Query2ClientProvider } from "@/lib/queryProvider";
import queryClient from "@/lib/reactQuery";
import { GlobalProvider } from "./contextGlobal";
import Cabecalho from "./cabecalho/cabecalho";
import Rodape from "./rodape/rodape";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JP Cash Flow",
  description: "Para suas necessidades financeiras",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <body className={inter.className}>
        <Query2ClientProvider client={queryClient}>
          <GlobalProvider userId={0}>
            <Cabecalho />

            {/* ===== Parte central ===== */}
            <div className="flex min-h-screen flex-col pt-14">
              <ClientDrawer />

              {/* Conteúdo */}
              <main className="flex flex-1 flex-col items-center bg-white">
                <div className="w-full max-w-6xl px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 overflow-x-auto">
                  {children}
                </div>
              </main>

              <Rodape />
            </div>
            {/* ======================== */}
          </GlobalProvider>
        </Query2ClientProvider>
      </body>
    </html>
  );
}
