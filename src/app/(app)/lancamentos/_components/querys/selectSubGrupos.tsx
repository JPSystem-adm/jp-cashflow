// src/app/(app)/lancamentos/_components/querys/selectSubGrupos.tsx

"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useLancamentoContext } from "../contextLancamentoProvider";
import { listarSubGruposPorGrupo } from "@/app/(app)/actions/lancamentoAPI";

type SubGrupoOption = {
  id: number;
  nome: string;
  grupoId: number;
};

function toSubGrupoOptions(data: unknown): SubGrupoOption[] {
  if (!Array.isArray(data)) return [];
  const out: SubGrupoOption[] = [];
  for (const it of data) {
    if (!it || typeof it !== "object") continue;
    const obj = it as Record<string, unknown>;
    const id = obj.id;
    const nome = obj.nome;
    const grupoId = obj.grupoId;

    if (
      typeof id === "number" &&
      Number.isFinite(id) &&
      id > 0 &&
      typeof nome === "string" &&
      nome.trim() &&
      typeof grupoId === "number" &&
      Number.isFinite(grupoId) &&
      grupoId > 0
    ) {
      out.push({ id, nome, grupoId });
    }
  }
  return out;
}

export default function ComboSubGrupos({ pai }: { pai: "Filtro" | "Form" }) {
  const {
    // filtro
    grupoId,
    subGrupoId,
    setSubGrupoId,
    // form
    formGrupoId,
    formSubGrupoId,
    setFormSubGrupoId,
  } = useLancamentoContext();

  const selectedGrupoId = pai === "Form" ? formGrupoId : grupoId;
  const selectedSubGrupoId = pai === "Form" ? formSubGrupoId : subGrupoId;

  const enabled = selectedGrupoId > 0;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lancamentos", "subgrupos", "grupo", selectedGrupoId],
    queryFn: async () => listarSubGruposPorGrupo(selectedGrupoId),
    enabled,
    refetchOnWindowFocus: false,
  });

  const options = useMemo(() => toSubGrupoOptions(data), [data]);

  const onChangeValue = (v: string) => {
    const id = Number(v);
    const safeId = Number.isFinite(id) && id > 0 ? id : 0;

    if (pai === "Form") setFormSubGrupoId(safeId);
    else setSubGrupoId(safeId);
  };

  return (
    <div className="w-full">
      {pai === "Filtro" ? <Label className="sr-only">Sub-Conta</Label> : null}

      <Select
        value={selectedSubGrupoId > 0 ? String(selectedSubGrupoId) : ""}
        onValueChange={onChangeValue}
        disabled={!enabled}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue
            placeholder={
              !enabled
                ? "Selecione uma Conta primeiro"
                : isLoading
                  ? "Carregando..."
                  : isError
                    ? "Erro ao carregar"
                    : "Selecione a Sub-Conta"
            }
          />
        </SelectTrigger>

        <SelectContent>
          {!enabled ? (
            <SelectItem value="0" disabled>
              Selecione uma Conta primeiro
            </SelectItem>
          ) : options.length === 0 ? (
            <SelectItem value="0" disabled>
              Nenhuma sub-conta encontrada
            </SelectItem>
          ) : (
            options.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.nome}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
