// src/app/(app)/dashboard/_components/selectContas.tsx
"use client";

import { useDashboardContext } from "./contextDashboardProvider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectContas() {
  const { gruposDespesas, grupoId, setGrupoId, loading } = useDashboardContext();

  const onChange = (value: string) => {
    const id = Number(value);
    setGrupoId(Number.isFinite(id) ? id : 0);
  };

  const isDisabled = loading.grupos || gruposDespesas.length === 0;

  return (
    <div>
      <Select value={String(grupoId)} onValueChange={onChange} disabled={isDisabled}>
        <SelectTrigger className="w-full text-sky-800 border">
          <SelectValue placeholder={isDisabled ? "Carregando..." : "Selecione a conta"} />
        </SelectTrigger>

        <SelectContent className="border p-0">
          <SelectGroup className="bg-white text-sky-900">
            <SelectItem className="bg-sky-50 text-sky-900" value="0">
              Selecione...
            </SelectItem>

            {gruposDespesas.map((item) => {
              const id = item.id ?? 0;
              return (
                <SelectItem className="bg-sky-50 text-sky-900" key={id} value={String(id)}>
                  {item.nome}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>

      <p className="mt-1 text-xs text-slate-500">
        Para ver o gráfico de subcontas, selecione um grupo.
      </p>
    </div>
  );
}
