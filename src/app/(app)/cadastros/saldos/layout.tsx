// src/app/(app)/cadastros/saldos/layout.tsx

"use client";

import type { ReactNode } from "react";
import { SaldosProvider } from "./_components/contextSaldosProvider";

type Props = { children: ReactNode };

export default function SaldosLayout({ children }: Props) {
  return <SaldosProvider>{children}</SaldosProvider>;
}
