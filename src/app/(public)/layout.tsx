// src/app/(public)/layout.tsx

import type { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-white text-slate-900">
        {children}
      </body>
    </html>
  );
}

