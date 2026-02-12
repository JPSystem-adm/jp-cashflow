// src/app/(app)/lancamentos/_components/querys/selectFontes.tsx

"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useLancamentoContext } from "../contextLancamentoProvider";
import { listarFontesAtivas } from "@/app/(app)/actions/lancamentoAPI";

type FonteOption = {
  id: number;
  nome: string;
};

function toFonteOptions(data: unknown): FonteOption[] {
  if (!Array.isArray(data)) return [];
  const out: FonteOption[] = [];
  for (const it of data) {
    if (!it || typeof it !== "object") continue;
    const obj = it as Record<string, unknown>;
    const id = obj.id;
    const nome = obj.nome;

    if (typeof id === "number" && Number.isFinite(id) && id > 0 && typeof nome === "string" && nome.trim()) {
      out.push({ id, nome });
    }
  }
  return out;
}

export default function ComboFontes({ pai }: { pai: "Filtro" | "FormO" | "FormD" }) {
  const {
    // filtro
    fonteId,
    setFonteId,
    // form
    formFonteIdO,
    setFormFonteIdO,
    formFonteIdD,
    setFormFonteIdD,
  } = useLancamentoContext();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lancamentos", "fontes", "ativas"],
    queryFn: async () => listarFontesAtivas(),
    refetchOnWindowFocus: false,
  });

  const options = useMemo(() => toFonteOptions(data), [data]);

  const value =
    pai === "FormO" ? formFonteIdO : pai === "FormD" ? (formFonteIdD ?? 0) : fonteId;

  const onChangeValue = (v: string) => {
    const id = Number(v);
    const safeId = Number.isFinite(id) && id > 0 ? id : 0;

    if (pai === "FormO") setFormFonteIdO(safeId);
    else if (pai === "FormD") setFormFonteIdD(safeId > 0 ? safeId : null);
    else setFonteId(safeId);
  };

  return (
    <div className="w-full">
      {pai === "Filtro" ? <Label className="sr-only">Fonte</Label> : null}

      <Select value={value > 0 ? String(value) : ""} onValueChange={onChangeValue}>
        <SelectTrigger className="w-full bg-white">
          <SelectValue
            placeholder={
              isLoading ? "Carregando..." : isError ? "Erro ao carregar" : "Selecione a Fonte"
            }
          />
        </SelectTrigger>

        <SelectContent>
          {options.length === 0 ? (
            <SelectItem value="0" disabled>
              Nenhuma fonte ativa encontrada
            </SelectItem>
          ) : (
            options.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.nome}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
