// src/app/layout.tsx

import "./globals.css";

export const metadata = {
    title: "JP CashFlow",
    description: "SaaS de controle financeiro",
  }
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="pt-BR" className="light" suppressHydrationWarning>
        <body>{children}</body>
      </html>
    )
  }
  