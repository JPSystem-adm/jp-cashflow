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

// import type { ReactNode } from "react";

// export default function HomeLayout({ children }: { children: ReactNode }) {
//   return (
//     <div className="min-h-screen bg-white text-slate-900">
//       {/* Fundo com leve gradiente */}
//       <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-sky-50 via-white to-white" />

//       {children}
//     </div>
//   );
// }
