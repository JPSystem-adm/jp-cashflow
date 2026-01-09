// src/app/(app)/lancamentos/_components/painelFiltros.tsx

"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale"; // Importa a localização em português
import { useState } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "react-query";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { useLancamentoContext } from "./contextLancamentoProvider";
import { tyLancamento } from "@/types/types";
import { getLancamentos } from "@/app/(app)/actions/lancamentoActions";
import ComboGrupos from "./querys/selectGrupos";
import ComboSubGrupos from "./querys/selectSubGrupos";
import ComboFontes from "./querys/selectFontes";
import { retDataDoPeriodo } from "@/lib/formatacoes";

export default function PainelFiltros() {
  const { dados, setDados, fonteId, subGrupoId, grupoId } = useLancamentoContext();
  const { periodoId, periodo } = useGlobalContext();

  // Carrega os Lancamentos
  const { data, isLoading, refetch } = useQuery(
    ["lancamentos", periodoId, grupoId, subGrupoId, fonteId],
    async () => {
      const response: tyLancamento[] = await getLancamentos(periodoId, grupoId, subGrupoId, fonteId);
      setDados(response);
      return response;
    }
  );

  const [selDate, setSelDate] = useState<Date>(retDataDoPeriodo(periodo));
  const [isDatePickerEnabled, setIsDatePickerEnabled] = useState(true);

  // Calcula o primeiro e o último dia do mês atual
  const currentDate = selDate;
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  return (
    <div className="max-w-full mx-auto md:max-w-7xl overflow-x-auto min-w-screen">
      <Card className="border-sky-900 border-2 min-w-[750px]">
        <CardHeader>
          <CardTitle className="font-semibold text-sky-900">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="block text-sm font-medium text-sky-900">
                Conta
              </Label>
              <ComboGrupos pai="Filtros" />
            </div>
            <div>
              <Label className="block text-sm font-medium text-sky-900">
                Sub-Conta
              </Label>
              <ComboSubGrupos pai="Filtros" />
            </div>
            {/* Ícone de agenda do date picker */}
            <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
            ></link>
            {/* Ícone de agenda do date picker */}
            <div className="text-sky-900 text-lg">
              <Label className="block text-sm font-medium text-sky-900">
                Data
              </Label>
              <div className="flex items-center border-2 border-sky-900 rounded-md w-full sm:w-auto">
                <div
                  className={`${
                    !isDatePickerEnabled
                      ? "bg-slate-200 w-full sm:w-[300px]"
                      : ""
                  } h-8 flex items-center rounded-md`}
                >
                  <DatePicker
                    showIcon
                    icon="fa fa-calendar"
                    dateFormat="E - dd/MMMM"
                    selected={selDate}
                    minDate={firstDayOfMonth}
                    maxDate={lastDayOfMonth}
                    onChange={(date) => setSelDate(date ?? new Date())}
                    closeOnScroll={true}
                    className={`text-sky-800 text-center h-8 pb-1 text-lg w-full border-none outline-none ${
                      !isDatePickerEnabled
                        ? "bg-slate-200 cursor-not-allowed"
                        : "hover:bg-slate-100"
                    }`}
                    showMonthDropdown={false}
                    showYearDropdown={false}
                    showPopperArrow={false}
                    isClearable={false}
                    locale={ptBR}
                    disabled={!isDatePickerEnabled}
                    onKeyDown={(e) => {
                      e.preventDefault();
                    }}
                  />
                </div>
                {/* Adiciona um divisor horizontal entre a data e o checkbox */}
                <div className="border-l-2 border-sky-900 h-8"></div>
                <input
                  type="checkbox"
                  checked={isDatePickerEnabled}
                  onChange={() => setIsDatePickerEnabled(!isDatePickerEnabled)}
                  className="mx-2 cursor-pointer"
                  title="Ativar/Desativar DatePicker"
                />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-sky-900">
                Fonte
              </Label>
              <ComboFontes pai="Filtros" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
