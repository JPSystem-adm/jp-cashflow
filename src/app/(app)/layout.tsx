// src/app/(app)/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";

import ClientDrawer from "./_components/ClientDrawer";
import BottomNav from "./_components/BottomNav";

import { Query2ClientProvider } from "@/lib/queryProvider";
import { GlobalProvider } from "./contextGlobal";
import Cabecalho from "./cabecalho/cabecalho";
import Rodape from "./rodape/rodape";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JP Cash Flow",
  description: "Para suas necessidades financeiras",
};

function normalizeTenant(value: string | undefined): string | null {
  const v = (value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!v) return null;
  if (!/^[a-z0-9-]+$/i.test(v)) return null;
  return v;
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = cookies();
  const tenant = normalizeTenant(cookieStore.get("tenant")?.value);

  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Provider do React Query (CLIENT) */}
        <Query2ClientProvider>
          {/* Provider global da aplicação */}
          <GlobalProvider userId={0}>
            <Cabecalho />

            <div className="flex min-h-dvh flex-col pt-14 sm:pt-14">
              <ClientDrawer tenant={tenant ?? undefined} />

              {/* Conteúdo principal */}
              <main className="flex flex-1 flex-col items-center bg-white pb-16 sm:pb-0">
                <div className="w-full max-w-6xl px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4">
                  {children}
                </div>
              </main>

              {/* Rodapé só no desktop */}
              <div className="hidden sm:block">
                <Rodape />
              </div>

              {/* Navegação mobile */}
              <BottomNav />
            </div>
          </GlobalProvider>
        </Query2ClientProvider>
      </body>
    </html>
  );
}
