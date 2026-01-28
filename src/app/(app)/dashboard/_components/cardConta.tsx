// src/app/(app)/dashboard/_components/cardConta.tsx
"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LuInfo } from "react-icons/lu";

import { useDashboardContext } from "./contextDashboardProvider";

type DetalheItem = { titulo: string; valor: number };

type CardContaProps = {
  icone: string;
  conta:
    | "Despesas"
    | "Receitas"
    | "Cartões de crédito"
    | "Saldo disponível"
    | "Investimentos";
};

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function toNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function CardConta({ icone, conta }: CardContaProps) {
  const { despesas, entradas, somatoriasFontes, kpis, loading } = useDashboardContext();

  const { valor, detalhes } = useMemo((): { valor: number; detalhes: DetalheItem[] } => {
    if (conta === "Despesas") {
      const detalhes: DetalheItem[] = despesas
        .map((d) => ({ titulo: String(d.Grupo), valor: toNumber(d.valorReal) }))
        .filter((x) => x.titulo.trim().length > 0 && Number.isFinite(x.valor))
        .sort((a, b) => b.valor - a.valor);

      return { valor: kpis.totalDespesas, detalhes };
    }

    if (conta === "Receitas") {
      const detalhes: DetalheItem[] = entradas
        .map((e) => ({ titulo: String(e.SubGrupo), valor: toNumber(e.valorReal) }))
        .filter((x) => x.titulo.trim().length > 0 && Number.isFinite(x.valor))
        .sort((a, b) => b.valor - a.valor);

      return { valor: kpis.totalReceitas, detalhes };
    }

    if (conta === "Cartões de crédito") {
      const detalhes: DetalheItem[] = somatoriasFontes
        .filter((s) => String(s.Tipo ?? "") === "C")
        .map((s) => ({ titulo: String(s.Fonte), valor: toNumber(s.saldoAtual) }))
        .filter((x) => x.titulo.trim().length > 0 && Number.isFinite(x.valor))
        .sort((a, b) => b.valor - a.valor);

      return { valor: kpis.totalCartoes, detalhes };
    }

    if (conta === "Saldo disponível") {
      const detalhes: DetalheItem[] = somatoriasFontes
        .filter((s) => String(s.Tipo ?? "") === "M")
        .map((s) => ({ titulo: String(s.Fonte), valor: toNumber(s.saldoAtual) }))
        .filter((x) => x.titulo.trim().length > 0 && Number.isFinite(x.valor))
        .sort((a, b) => b.valor - a.valor);

      return { valor: kpis.totalDisponivel, detalhes };
    }

    // Investimentos
    const detalhes: DetalheItem[] = somatoriasFontes
      .filter((s) => String(s.Tipo ?? "") === "A")
      .map((s) => ({ titulo: String(s.Fonte), valor: toNumber(s.saldoAtual) }))
      .filter((x) => x.titulo.trim().length > 0 && Number.isFinite(x.valor))
      .sort((a, b) => b.valor - a.valor);

    return { valor: kpis.totalInvestimentos, detalhes };
  }, [conta, despesas, entradas, somatoriasFontes, kpis]);

  const isLoading =
    conta === "Despesas"
      ? loading.despesas
      : conta === "Receitas"
      ? loading.entradas
      : loading.somatorias;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={`/${icone}`} />
          <AvatarFallback>
            <LuInfo />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="text-sm sm:text-base font-semibold text-sky-900 truncate">
            {conta}
          </div>

          {isLoading ? (
            <div className="text-lg sm:text-xl font-bold text-slate-400">Carregando…</div>
          ) : (
            <div className="text-lg sm:text-xl font-bold text-sky-800">
              {formatBRL(valor)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="py-2">
              <span className="text-sm text-sky-800/80">
                {isLoading ? "Carregando detalhes…" : detalhes.length ? "Mostrar detalhes" : "Sem detalhes"}
              </span>
            </AccordionTrigger>

            <AccordionContent>
              <div className="mt-1">
                {isLoading ? (
                  <div className="text-sm text-slate-500">Aguarde…</div>
                ) : detalhes.length === 0 ? (
                  <div className="text-sm text-slate-500">Nenhum item para exibir.</div>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {detalhes.map((d) => (
                        <tr key={d.titulo}>
                          <td className="pr-2 font-semibold text-slate-800 align-top w-[60%] break-words">
                            {d.titulo}
                          </td>
                          <td className="text-right text-slate-700 w-[40%]">
                            {formatBRL(d.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
