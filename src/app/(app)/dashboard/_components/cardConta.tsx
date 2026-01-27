// src/app/(app)/dashboard/_components/cardConta.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LuInfo } from "react-icons/lu";

type DetalheItem = { titulo: string; valor: number };

type CardContaProps = {
  icone: string;
  conta: string;
  valor: number;
  detalhes: DetalheItem[];
};

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function CardConta({ icone, conta, valor, detalhes }: CardContaProps) {
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
          <div className="text-sm sm:text-base font-semibold text-sky-900 truncate">{conta}</div>
          <div className="text-lg sm:text-xl font-bold text-sky-800">{formatBRL(valor)}</div>
        </div>
      </div>

      <div className="mt-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="py-2">
              <span className="text-sm text-sky-800/80">
                {detalhes.length ? "Mostrar detalhes" : "Sem detalhes"}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-1">
                {detalhes.length === 0 ? (
                  <div className="text-sm text-slate-500">Nenhum item para exibir.</div>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {detalhes.map((d) => (
                        <tr key={d.titulo}>
                          <td className="pr-2 font-semibold text-slate-800 align-top w-[60%] break-words">
                            {d.titulo}
                          </td>
                          <td className="text-right text-slate-700 w-[40%]">{formatBRL(d.valor)}</td>
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
