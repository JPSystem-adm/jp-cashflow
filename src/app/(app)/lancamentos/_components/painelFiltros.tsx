// src/app/(app)/lancamentos/_components/painelFiltros.tsx
"use client";

import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import { startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "react-query";
import { Calendar } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { useLancamentoContext } from "./contextLancamentoProvider";
import type { tyLancamento } from "@/types/types";

import ComboGrupos from "./querys/selectGrupos";
import ComboSubGrupos from "./querys/selectSubGrupos";
import ComboFontes from "./querys/selectFontes";

import { retDataDoPeriodo } from "@/lib/formatacoes";
import { listarLancamentos } from "@/app/(app)/actions/lancamentoAPI";

type DateInputProps = {
  value?: string;
  onClick?: () => void;
};

// ✅ react-datepicker passa ref pro customInput, então precisa forwardRef
const DateInput = React.forwardRef<HTMLButtonElement, DateInputProps>(function DateInput(
  { value, onClick },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={[
        "w-full h-11 px-3 rounded-md border border-input",
        "flex items-center justify-between gap-3",
        "bg-white text-sky-900 hover:bg-slate-50",
      ].join(" ")}
    >
      <span className="text-base truncate">
        {value && value.trim().length > 0 ? value : "Selecione uma data"}
      </span>
      <Calendar className="h-5 w-5 text-sky-700 shrink-0" />
    </button>
  );
});

export default function PainelFiltros() {
  const { setDados, fonteId, subGrupoId, grupoId } = useLancamentoContext();
  const { periodoId, periodo } = useGlobalContext();

  const [selDate, setSelDate] = useState<Date>(() => retDataDoPeriodo(periodo));
  const [isDatePickerEnabled, setIsDatePickerEnabled] = useState(true);

  const firstDayOfMonth = useMemo(() => startOfMonth(selDate), [selDate]);
  const lastDayOfMonth = useMemo(() => endOfMonth(selDate), [selDate]);

  useQuery(
    ["lancamentos", periodoId, grupoId, subGrupoId, fonteId],
    async () => {
      if (!periodoId) return [];

      const response = await listarLancamentos({
        periodoId,
        grupoId: grupoId > 0 ? grupoId : undefined,
        subGrupoId: subGrupoId > 0 ? subGrupoId : undefined,
        fonteId: fonteId > 0 ? fonteId : undefined,
      });

      const dadosLanc: tyLancamento[] = response as unknown as tyLancamento[];

      setDados(dadosLanc);
      return dadosLanc;
    },
    {
      enabled: Boolean(periodoId),
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Card className="w-full border-sky-900 border-2">
      <CardHeader className="pb-2">
        <CardTitle className="font-semibold text-sky-900">Filtros</CardTitle>
      </CardHeader>

      <CardContent className="overflow-visible">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <Label className="block text-sm font-medium text-sky-900">Conta</Label>
            {/* ✅ era "Filtros" -> agora "Filtro" */}
            <ComboGrupos pai="Filtro" />
          </div>

          <div className="min-w-0">
            <Label className="block text-sm font-medium text-sky-900">Sub-Conta</Label>
            {/* ✅ era "Filtros" -> agora "Filtro" */}
            <ComboSubGrupos pai="Filtro" />
          </div>

          <div className="min-w-0">
            <Label className="block text-sm font-medium text-sky-900">Data</Label>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <DatePicker
                  selected={selDate}
                  onChange={(date) => setSelDate(date ?? new Date())}
                  dateFormat="E - dd/MMMM"
                  minDate={firstDayOfMonth}
                  maxDate={lastDayOfMonth}
                  closeOnScroll={true}
                  locale={ptBR}
                  disabled={!isDatePickerEnabled}
                  showMonthDropdown={false}
                  showYearDropdown={false}
                  showPopperArrow={false}
                  isClearable={false}
                  onKeyDown={(e) => e.preventDefault()}
                  customInput={<DateInput />}
                />
              </div>

              <label className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={isDatePickerEnabled}
                  onChange={() => setIsDatePickerEnabled((v) => !v)}
                  className="cursor-pointer"
                  title="Ativar/Desativar Data"
                />
                <span className="text-xs sm:text-sm text-sky-900">Ativar</span>
              </label>
            </div>
          </div>

          <div className="min-w-0">
            <Label className="block text-sm font-medium text-sky-900">Fonte</Label>
            {/* ✅ ComboFontes também usa "Filtro" */}
            <ComboFontes pai="Filtro" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
