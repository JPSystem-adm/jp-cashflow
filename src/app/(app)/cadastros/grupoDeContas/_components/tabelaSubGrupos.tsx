// src/app/(app)/cadastros/grupoDeContas/_components/tabelaSubGrupos.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
//import { useQuery } from "react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

import { FileEditIcon, TrashIcon } from "@/app/(app)/_components/iconsForm";
import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
import queryClient from "@/lib/reactQuery";

import NovoSubGrupo from "./novoSubGrupo";
import EditaSubGrupo from "./editaSubGrupo";

import type { tyResult, tySubGrupo } from "@/types/types";
import {
  listarSubGruposDoGrupo,
  criarSubGrupoNoGrupo,
  atualizarSubGrupo,
  excluirSubGrupo,
} from "@/app/(app)/actions/subGrupoAPI";

interface Props {
  origem: "Novo" | "Edicao";
  grupoId: number;
  dados: tySubGrupo[];
  setSubGruposP: React.Dispatch<React.SetStateAction<tySubGrupo[]>>;
}

function mkResult(status: "Sucesso" | "Erro", menssagem: string): tyResult {
  return { status, menssagem, dados: {} };
}

export default function TabelaSubGrupos({ origem, grupoId, dados, setSubGruposP }: Props) {
  const queryClient = useQueryClient();

  const [subGrupos, setSubGrupos] = useState<tySubGrupo[]>(dados);
  const [isEdita, setIsEdita] = useState<boolean>(false);
  const [indexSG, setIndexSG] = useState<number>(0);

  const [showAlerta, setShowAlerta] = useState<boolean>(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState<string>("");

  function fecharAviso(): void {
    setShowAlerta(false);
  }

  function sync(next: tySubGrupo[]): void {
    setSubGrupos(next);
    setSubGruposP(next);
  }

  // Modo NOVO: acompanha o state do pai
  useEffect(() => {
    if (origem === "Novo") setSubGrupos(dados);
  }, [dados, origem]);

  const shouldFetch = origem === "Edicao" && grupoId > 0;

  const { isLoading, isError, error } = useQuery<tySubGrupo[], Error>({
    queryKey: ["subgrupos-do-grupo", grupoId],
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
    queryFn: async (): Promise<tySubGrupo[]> => {
      const list = await listarSubGruposDoGrupo(grupoId);
      sync(list);
      return list;
    },
  });

  const listaOrdenada = useMemo(() => {
    return [...subGrupos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [subGrupos]);

  async function handleAddSubGrupo(item: tySubGrupo): Promise<tyResult> {
    const nome = item.nome.trim().toUpperCase();
    if (!nome) return mkResult("Erro", "Informe o nome do subgrupo.");

    const duplicado = subGrupos.some((sg) => sg.nome.trim().toUpperCase() === nome);
    if (duplicado) return mkResult("Erro", "Nome de subgrupo duplicado dentro do grupo.");

    // NOVO: só local
    if (origem === "Novo") {
      const next = [...subGrupos, { ...item, nome, ativo: item.ativo ?? true }];
      sync(next);
      void queryClient.invalidateQueries({ queryKey: ["grupos"] });
      return mkResult("Sucesso", "Subgrupo incluído (pendente de salvar o grupo).");
    }

    // EDICAO: persistir na API (rota aninhada)
    try {
      const res = await criarSubGrupoNoGrupo(grupoId, {
        nome,
        descricao: item.descricao,
      });

      if (res.status >= 300) {
        const msg =
          typeof res.dados === "object" && res.dados !== null && "message" in (res.dados as Record<string, unknown>)
            ? String((res.dados as Record<string, unknown>).message)
            : res.statusText;

        return mkResult("Erro", msg);
      }

      // Recarrega a lista oficial da API (mais seguro)
      void queryClient.invalidateQueries({
        queryKey: ["subgrupos-do-grupo", grupoId],
      });
      void queryClient.invalidateQueries({ queryKey: ["grupos"] });
      return mkResult("Sucesso", "Subgrupo criado com sucesso!");
    } catch (e) {
      return mkResult("Erro", e instanceof Error ? e.message : "Erro inesperado ao criar subgrupo.");
    }
  }

  function handleEditSubGrupo(nome?: string): void {
    if (!nome) return;
    const idx = subGrupos.findIndex((x) => x.nome === nome);
    if (idx < 0) return;
    setIndexSG(idx);
    setIsEdita(true);
  }

  async function handleApplyEdit(
    nome: string,
    novosDados: { descricao?: string; ativo?: boolean }
  ): Promise<boolean> {
    const atual = subGrupos.find((x) => x.nome === nome);
    if (!atual) return false;

    // NOVO: só local
    if (origem === "Novo") {
      const next = subGrupos.map((sg) => (sg.nome === nome ? { ...sg, ...novosDados } : sg));
      sync(next);
      void queryClient.invalidateQueries({ queryKey: ["grupos"] });
      return true;
    }

    // EDICAO: patch via rota própria (sua doc diz que aqui só permite descricao/ativo)
    const id = atual.id ?? 0;
    if (id <= 0) {
      setTipo(tipoEnu.Erro);
      setMensagem("ID do subgrupo inválido para atualização.");
      setShowAlerta(true);
      return false;
    }

    const res = await atualizarSubGrupo(id, {
      descricao: novosDados.descricao,
      ativo: novosDados.ativo,
    });

    if (res.status >= 300) {
      setTipo(tipoEnu.Erro);
      setMensagem("Não foi possível atualizar o subgrupo.");
      setShowAlerta(true);
      return false;
    }

    void queryClient.invalidateQueries({
      queryKey: ["subgrupos-do-grupo", grupoId],
    });
    void queryClient.invalidateQueries({ queryKey: ["grupos"] });
    return true;
  }

  async function handleDeleteSubGrupo(index: number): Promise<void> {
    const item = subGrupos[index];
    if (!item) return;

    // NOVO: só local
    if (origem === "Novo") {
      const next = subGrupos.filter((_, i) => i !== index);
      sync(next);
      void queryClient.invalidateQueries({ queryKey: ["grupos"] });
      return;
    }

    // EDICAO: deletar pela rota própria (bloqueia se tiver lançamentos)
    const id = item.id ?? 0;
    if (id <= 0) {
      setTipo(tipoEnu.Erro);
      setMensagem("ID do subgrupo inválido para exclusão.");
      setShowAlerta(true);
      return;
    }

    const res = await excluirSubGrupo(id);

    if (res.status >= 300) {
      // tenta extrair mensagem (muito útil no bloqueio por lançamentos)
      const msg =
        typeof res.dados === "object" && res.dados !== null && "message" in (res.dados as Record<string, unknown>)
          ? String((res.dados as Record<string, unknown>).message)
          : "Não foi possível excluir. Pode haver lançamentos vinculados.";

      setTipo(tipoEnu.Erro);
      setMensagem(msg);
      setShowAlerta(true);
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: ["subgrupos-do-grupo", grupoId],
    });
    void queryClient.invalidateQueries({ queryKey: ["grupos"] });
  }

  if (isLoading) {
    return <div className="p-4 text-center text-sky-900">Carregando subgrupos...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-700">
        Erro ao carregar subgrupos: {error?.message ?? "Erro desconhecido"}
      </div>
    );
  }

  return (
    <>
      {showAlerta && <WarningBox tipo={tipo} mensagem={mensagem} onCancel={fecharAviso} />}

      <div className="w-full">
        <Card className="w-full">
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-3 p-3">
              <div className="font-bold">
                <div className="text-lg sm:text-2xl text-sky-900">Subgrupos</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {origem === "Novo"
                    ? "Monte os subgrupos antes de salvar o grupo."
                    : "Gerencie os subgrupos do grupo."}
                </div>
              </div>

              <NovoSubGrupo onAddItem={handleAddSubGrupo} />
            </div>

            <div className="overflow-x-auto px-2 pb-3">
              <Table className="min-w-[720px] rounded-2xl border-sky-800 border-2 shadow">
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-base sm:text-lg">
                      Nome
                    </TableHead>
                    <TableHead className="hidden sm:table-cell bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-base sm:text-lg">
                      Descrição
                    </TableHead>
                    <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-base sm:text-lg w-[110px]">
                      Ativo
                    </TableHead>
                    <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-base sm:text-lg w-[140px]">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {listaOrdenada.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="border-2 border-sky-900 text-center text-slate-500">
                        Nenhum subgrupo encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    listaOrdenada.map((sg, idx) => (
                      <TableRow
                        key={`${sg.id ?? "x"}-${sg.nome}-${idx}`}
                        className={`hover:bg-slate-200 ${
                          sg.ativo === false ? "text-red-900 bg-red-100" : "text-sky-900"
                        }`}
                      >
                        <TableCell className="border-2 border-sky-900 text-center text-base sm:text-lg">
                          {sg.nome}
                        </TableCell>

                        <TableCell className="hidden sm:table-cell border-2 border-sky-900 text-center text-base sm:text-lg">
                          {sg.descricao}
                        </TableCell>

                        <TableCell className="border-2 border-sky-900 text-center text-base sm:text-lg">
                          {sg.ativo === false ? "Não" : "Sim"}
                        </TableCell>

                        <TableCell className="border-2 border-sky-900 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              onClick={() => handleEditSubGrupo(sg.nome)}
                              className="h-8 w-8"
                              size="icon"
                              variant="ghost"
                            >
                              <FileEditIcon className="h-5 w-5" />
                              <span className="sr-only">Editar</span>
                            </Button>

                            <Button
                              onClick={() => void handleDeleteSubGrupo(idx)}
                              className="h-8 w-8"
                              size="icon"
                              variant="ghost"
                            >
                              <TrashIcon className="h-5 w-5 text-red-700" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {isEdita && subGrupos[indexSG] && (
          <EditaSubGrupo
            onEditItem={handleApplyEdit}
            data={subGrupos[indexSG]}
            isEdita={isEdita}
            setIsEdita={setIsEdita}
          />
        )}
      </div>
    </>
  );
}
