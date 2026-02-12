// src/app/(app)/cadastros/grupoDeContas/_components/editaGrupo.tsx

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaChevronDown } from "react-icons/fa";

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

//import queryClient from "@/lib/reactQuery";
import { useQueryClient } from "@tanstack/react-query";

import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
import { tipoGrupo } from "@/types/types";
import type { tyGrupo } from "@/types/types";


import { atualizarGrupo } from "@/app/(app)/actions/grupoAPI";
import TabelaSubGrupos from "./tabelaSubGrupos";

// Se você quiser usar seu contexto global (pra limpar também), mantém:
import { useGlobalContext } from "@/app/(app)/contextGlobal";

interface Props {
  pIndice: number; // legado do seu componente pai (não vamos usar como id real)
  pItem: tyGrupo | undefined;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
}

const schema = z.object({
  nome: z.string().min(2, "Campo obrigatório!"),
  descricao: z.string().min(2, "Campo obrigatório!"),
  ativo: z.boolean().default(true),
  tipo: z.nativeEnum(tipoGrupo, {
    errorMap: () => ({
      message: "Informe 'D' para débito, 'C' para crédito ou 'M' para conta de movimentação.",
    }),
  }),
});

type FormProps = z.infer<typeof schema>;

function getSubdomainFromHost(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.host; // ex: jp.localhost:3000
  const hostname = host.split(":")[0];
  const isLocalhost = hostname.includes("localhost");
  const parts = hostname.split(".");

  if (isLocalhost && parts.length === 2) return parts[0]; // jp.localhost
  if (!isLocalhost && parts.length >= 3) return parts[0]; // cliente.dominio.com
  return null;
}

export default function EditaGrupoForm({ pItem, isEdita, setIsEdita }: Props) {
  const queryClient = useQueryClient();
  const router = useRouter();

  // 🔥 Pra forçar logout “completo” (cookie + contexto global)
  const {
    setUsuarioId,
    setUsuarioLogin,
    setUsuarioNome,
    setUsuarioPerfil,
    setEmailVerificacao,
    setCodigoVerificacao,
  } = useGlobalContext();

  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Mensagem default");

  const grupoId = useMemo(() => {
    const id = pItem?.id;
    return typeof id === "number" ? id : 0;
  }, [pItem?.id]);

  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: pItem?.nome ?? "",
      descricao: pItem?.descricao ?? "",
      tipo: pItem?.tipo ?? tipoGrupo.Debito,
      ativo: Boolean(pItem?.ativo),
    },
  });

  // Quando trocar o item (clicar em outro grupo), atualiza o form
  useEffect(() => {
    if (!pItem) return;
    form.reset({
      nome: pItem.nome ?? "",
      descricao: pItem.descricao ?? "",
      tipo: pItem.tipo ?? tipoGrupo.Debito,
      ativo: Boolean(pItem.ativo),
    });
  }, [pItem, form]);

  function forceLogout() {
    // 🧹 Cookie
    document.cookie = "token=; Max-Age=0; path=/";

    // 🧹 Contexto global
    setUsuarioId(0);
    setUsuarioLogin("");
    setUsuarioNome("");
    setUsuarioPerfil("");
    setEmailVerificacao("");
    setCodigoVerificacao("");

    // 🔁 Vai pro login com user do subdomínio (se tiver)
    const sub = getSubdomainFromHost();
    if (sub) router.replace(`/login?user=${encodeURIComponent(sub)}`);
    else router.replace("/login");
  }

  function handleClose() {
    setIsEdita(false);
  }

  function handleFecharAviso() {
    setShowAlerta(false);
    if (tipo === tipoEnu.Sucesso) {
      setIsEdita(false);
    }
  }

  async function onSubmit(values: FormProps) {
    if (!grupoId) {
      setTipo(tipoEnu.Erro);
      setMensagem("Grupo inválido. Recarregue a página e tente novamente.");
      setShowAlerta(true);
      return;
    }

    // Regras especiais: se quiser travar edição de nomes específicos
    const nomeUpper = (values.nome ?? "").toUpperCase();
    const isNomeProtegido = nomeUpper === "ENTRADA" || nomeUpper === "TRANSFERENCIAS";

    const payload = {
      nome: isNomeProtegido ? pItem?.nome : values.nome,
      descricao: values.descricao,
      tipo: values.tipo, // hoje você deixa disabled, mas ok manter
      ativo: values.ativo,
    };

    try {
      const retorno = await atualizarGrupo(grupoId, payload);

      if (retorno.status === 401) {
        setTipo(tipoEnu.Erro);
        setMensagem("Sua sessão expirou. Vou te deslogar pra você entrar de novo.");
        setShowAlerta(true);

        // dá um micro “respiro” pro usuário ver o aviso (opcional)
        // mas sem promessa de background: aqui é instantâneo
        forceLogout();
        return;
      }

      if (retorno.status < 300) {
        setTipo(tipoEnu.Sucesso);
        setMensagem("Grupo alterado com sucesso!");
        setShowAlerta(true);
        void queryClient.invalidateQueries({ queryKey: ["grupos"] });
        return;
      }

      // outros erros
      setTipo(tipoEnu.Erro);

      // tenta puxar msg de retorno.dados
      const maybeObj = retorno.dados as unknown;
      let msg = "Ocorreu um erro inesperado no servidor.";

      if (typeof maybeObj === "object" && maybeObj !== null) {
        const o = maybeObj as Record<string, unknown>;
        const m = o.erro ?? o.message ?? o.error;
        if (typeof m === "string" && m.trim()) msg = m;
      }

      setMensagem(msg);
      setShowAlerta(true);
    } catch (err) {
      setTipo(tipoEnu.Erro);
      setMensagem(`Ocorreu um erro inesperado! ${String(err)}`);
      setShowAlerta(true);
    }
  }

  return (
    <>
      {showAlerta && (
        <WarningBox tipo={tipo} mensagem={mensagem} onCancel={handleFecharAviso} />
      )}

      <Sheet open={isEdita} onOpenChange={setIsEdita}>
        <SheetContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[650px] w-[95vw] sm:w-[820px] overflow-auto rounded-2xl bg-white p-6 shadow-lg">
          <SheetHeader>
            <SheetTitle className="text-2xl text-sky-900">
              Editar grupo de Contas
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-5">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-900">Nome</FormLabel>
                          <FormControl>
                            <Input
                              disabled={
                                field.value?.toUpperCase() === "ENTRADA" ||
                                field.value?.toUpperCase() === "TRANSFERENCIAS"
                              }
                              className="placeholder:text-sky-800 border-2 border-sky-900"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-5">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-900">Tipo</FormLabel>
                          <FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild disabled>
                                <Button
                                  variant="outline"
                                  className="w-full text-sm flex items-center justify-between hover:bg-slate-200 text-sky-900 border-sky-900"
                                >
                                  {field.value === tipoGrupo.Debito
                                    ? "Débito"
                                    : field.value === tipoGrupo.Credito
                                    ? "Crédito"
                                    : "Movimentação"}
                                  <FaChevronDown />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent className="bg-white text-sm border-2 border-sky-900 text-sky-800">
                                <DropdownMenuItem
                                  className="hover:shadow-xl hover:bg-slate-200 text-sm"
                                  onClick={() => field.onChange(tipoGrupo.Debito)}
                                >
                                  Débito
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="hover:shadow-xl hover:bg-slate-200 text-sm"
                                  onClick={() => field.onChange(tipoGrupo.Credito)}
                                >
                                  Crédito
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="hover:shadow-xl hover:bg-slate-200 text-sm"
                                  onClick={() => field.onChange(tipoGrupo.Movimento)}
                                >
                                  Movimentação
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 sm:col-span-2 flex flex-col items-center justify-start sm:mt-6">
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                          <FormLabel className="text-sky-900">Ativo</FormLabel>
                          <FormControl>
                            <Checkbox
                              id="ativo"
                              className="border-2 border-sky-900"
                              checked={field.value}
                              onCheckedChange={(v) => field.onChange(Boolean(v))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sky-900">Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          className="placeholder:text-sky-800 border-2 border-sky-900"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SheetFooter className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="text-lg px-4 py-2 hover:bg-slate-200 border-sky-800 border-2"
                    type="submit"
                  >
                    Salvar
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="text-lg px-4 py-2 hover:bg-slate-200 border-sky-800 border-2"
                    onClick={handleClose}
                  >
                    Cancelar
                  </Button>
                </SheetFooter>
              </form>
            </Form>

            <div className="mt-6 text-sky-900">
              {/* ✅ Aqui é o pulo do gato: passa o ID real do grupo */}
              <TabelaSubGrupos
                origem="Edicao"
                grupoId={grupoId}
                dados={[]}
                // você estava usando subGruposP aqui.
                // Se sua TabelaSubGrupos usa dados+set, ok:
                setSubGruposP={() => {
                  /* no-op aqui; vamos ajustar quando revisar TabelaSubGrupos */
                }}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
