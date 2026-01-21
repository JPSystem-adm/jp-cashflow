// src/app/(app)/lancamentos/_components/querys/selectGrupos.tsx

"use client";

import React, { useEffect, useMemo } from "react";
import { useQuery } from "react-query";

import { useLancamentoContext } from "@/app/(app)/lancamentos/_components/contextLancamentoProvider";
import { listarGruposAtivos } from "@/app/(app)/actions/lancamentoAPI";
import type { GrupoApi, OperacaoLancamento, GrupoTipoApi } from "@/app/(app)/actions/lancamentoAPI";

type Props = {
  pai: "Filtro" | "Form";
};

function isAllowedTipo(tipo: GrupoTipoApi | undefined, operacao: OperacaoLancamento): boolean {
  if (operacao === "T") return tipo === "M"; // Transferência só grupo Movimento (M)
  // Movimentação só C ou D
  return tipo === "C" || tipo === "D";
}

export default function ComboGrupos({ pai }: Props) {
  const {
    // filtros
    grupoId,
    setGrupoId,
    setSubGrupoId,

    // form
    formGrupoId,
    setFormGrupoId,
    setFormSubGrupoId,

    // operação (M ou T)
    operacao,
  } = useLancamentoContext();

  const selectedId = pai === "Form" ? formGrupoId : grupoId;

  const { data, isLoading } = useQuery<GrupoApi[]>(
    ["grupos-ativos"],
    async () => {
      const grupos = await listarGruposAtivos();
      return grupos;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const gruposFiltrados = useMemo(() => {
    const grupos = Array.isArray(data) ? data : [];
    return grupos
      .filter((g) => Boolean(g.ativo))
      .filter((g) => isAllowedTipo(g.tipo, operacao))
      .sort((a, b) => {
        const ta = a.tipo ?? "";
        const tb = b.tipo ?? "";
        if (ta !== tb) return ta.localeCompare(tb);
        return a.nome.localeCompare(b.nome);
      });
  }, [data, operacao]);

  // ✅ Se trocar operação e o grupo atual não for permitido, zera seleção pra não ficar inválido.
  useEffect(() => {
    if (selectedId <= 0) return;

    const stillValid = gruposFiltrados.some((g) => Number(g.id ?? 0) === selectedId);
    if (stillValid) return;

    if (pai === "Form") {
      setFormGrupoId(0);
      setFormSubGrupoId(0);
    } else {
      setGrupoId(0);
      setSubGrupoId(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operacao, gruposFiltrados, pai]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const raw = e.target.value;
    const next = Number(raw);

    const nextId = Number.isFinite(next) && next > 0 ? next : 0;

    if (pai === "Form") {
      setFormGrupoId(nextId);
      setFormSubGrupoId(0); // reset subgrupo quando muda grupo
    } else {
      setGrupoId(nextId);
      setSubGrupoId(0); // reset subgrupo quando muda grupo
    }
  }

  return (
    <select
      value={selectedId > 0 ? String(selectedId) : ""}
      onChange={handleChange}
      className={[
        "w-full h-11 rounded-md border border-input bg-white px-3",
        "text-sky-900",
        "focus:outline-none focus:ring-2 focus:ring-sky-300",
      ].join(" ")}
      disabled={isLoading}
    >
      <option value="">{isLoading ? "Carregando..." : "Selecione a Conta"}</option>

      {gruposFiltrados.map((g) => {
        const id = Number(g.id ?? 0);
        if (!Number.isFinite(id) || id <= 0) return null;

        // opcional: mostrar tipo no label pra facilitar
        const tipoLabel = g.tipo === "C" ? "CRÉDITO" : g.tipo === "D" ? "DÉBITO" : "TRANSFERÊNCIA";
        const label = `${g.nome} (${tipoLabel})`;

        return (
          <option key={id} value={String(id)}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
