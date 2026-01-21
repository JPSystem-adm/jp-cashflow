// src/app/(app)/cabecalho/periodo.tsx
"use client";

import { useMemo } from "react";
import { useGlobalContext } from "../contextGlobal";
import { ensurePeriodo } from "@/app/(app)/actions/periodoAPI";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function buildMesAno(anoAtual: number): string[] {
  const mesAno: string[] = [];
  for (let ano = anoAtual; ano <= anoAtual + 10; ano++) {
    for (let mes = 0; mes < meses.length; mes++) {
      mesAno.push(`${meses[mes]}/${ano}`);
    }
  }
  return mesAno;
}

export default function Periodo() {
  const { usuarioId, periodo, setPeriodo, setPeriodoId } = useGlobalContext();

  const opcoes = useMemo(() => buildMesAno(new Date().getFullYear()), []);

  const onChange = async (value: string) => {
    if (usuarioId < 1) return;

    const prev = periodo;

    // UX: mostra a escolha imediatamente
    setPeriodo(value);

    try {
      const id = await ensurePeriodo(value);
      if (!Number.isFinite(id) || id <= 0) {
        // se vier inválido, volta pro anterior
        setPeriodo(prev);
        return;
      }

      // troca o id sem passar por 0
      setPeriodoId(id);
    } catch (e) {
      console.error("Erro ao garantir período:", e);
      // volta pro anterior pra não ficar "período sem id"
      setPeriodo(prev);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="hidden md:flex font-semibold text-base text-sky-50 items-center">
        Período
      </Label>

      <div className="w-[170px] sm:w-[220px]">
        <Select value={periodo} onValueChange={onChange}>
          <SelectTrigger className="h-9 bg-white/10 border-white/20 text-sky-50">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>

          <SelectContent className="border border-sky-950 p-0 bg-white">
            <SelectGroup className="bg-white text-sky-900">
              {opcoes.map((mesAno) => (
                <SelectItem key={mesAno} value={mesAno} className="text-sky-900">
                  {mesAno}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
