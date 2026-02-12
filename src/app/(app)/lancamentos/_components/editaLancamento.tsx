// src/app/(app)/lancamentos/_components/editaLancamento.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale";
import { startOfMonth, endOfMonth } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";
//import queryClient from "@/lib/reactQuery";
import { useQueryClient } from "@tanstack/react-query";

import { getTokenFromCookie } from "@/lib/getToken";
import { DoubleToRealBR, RealBRToDouble } from "@/lib/formatacoes";

import type { tyLancamento, tyResult } from "@/types/types";
import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { useLancamentoContext } from "./contextLancamentoProvider";

import ComboGrupos from "./querys/selectGrupos";
import ComboSubGrupos from "./querys/selectSubGrupos";
import ComboFontes from "./querys/selectFontes";

import type { OperacaoLancamento } from "@/app/(app)/actions/lancamentoAPI";

type Props = {
  pItem?: tyLancamento;
  pIndice: number;
  isEdita: boolean;
  setIsEdita: React.Dispatch<React.SetStateAction<boolean>>;
};

type FormValues = {
  descricao: string;
  valor: string;
  dtLancamento: Date;
};

// ✅ Aceita:
// - "376,21"
// - "R$ 376,21"
// - "1.234,56" / "R$ 1.234,56"
// - "376" / "R$ 376"
const moneyBRRegex =
  /^(?:R\$\s*)?\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$|^(?:R\$\s*)?\d+(?:,\d{1,2})?$/;

const schema = z.object({
  descricao: z.string().min(1, "Campo obrigatório!"),
  valor: z
    .string()
    .min(1, "Campo obrigatório!")
    .regex(moneyBRRegex, "Valor monetário inválido (ex: 1.234,56)"),
  dtLancamento: z.date(),
});

type DateInputProps = {
  value?: string;
  onClick?: () => void;
};

const DateInput = React.forwardRef<HTMLButtonElement, DateInputProps>(
  function DateInput({ value, onClick }, ref) {
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
  }
);

function getApiBaseUrl(): string {
  const v = process.env.NEXT_PUBLIC_BASEURL_API;
  if (!v) throw new Error("NEXT_PUBLIC_BASEURL_API não definida no .env");
  return v.replace(/\/$/, "");
}

type ApiErrorShape = {
  error?: { message?: string } | string;
  message?: string;
  erro?: string;
};

function pickApiErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "Erro inesperado no servidor.";
  const d = data as ApiErrorShape;

  if (typeof d.error === "string") return d.error;
  if (
    d.error &&
    typeof d.error === "object" &&
    typeof d.error.message === "string"
  )
    return d.error.message;

  return d.message || d.erro || "Erro inesperado no servidor.";
}

function normalizeOperacao(op: unknown): OperacaoLancamento {
  return op === "T" ? "T" : "M";
}

function operacaoLabel(op: OperacaoLancamento): string {
  return op === "T" ? "Transferência" : "Movimentação";
}

/**
 * ✅ Anti "dia -1":
 * - Se vier ISO (2026-01-01T00:00:00.000Z), pega YYYY-MM-DD
 * - Cria Date LOCAL ao meio-dia (12:00) pra nunca cair no dia anterior
 */
function parseApiDateToLocalNoon(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      12,
      0,
      0
    );
  }

  if (typeof value === "string") {
    const s = value.slice(0, 10); // YYYY-MM-DD
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) {
      const y = Number(m[1]);
      const mm = Number(m[2]);
      const d = Number(m[3]);
      if (
        Number.isFinite(y) &&
        Number.isFinite(mm) &&
        Number.isFinite(d) &&
        mm >= 1 &&
        mm <= 12 &&
        d >= 1 &&
        d <= 31
      ) {
        return new Date(y, mm - 1, d, 12, 0, 0);
      }
    }

    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      return new Date(
        dt.getFullYear(),
        dt.getMonth(),
        dt.getDate(),
        12,
        0,
        0
      );
    }
  }

  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0
  );
}

/** Envia como data pura "YYYY-MM-DD" */
function toISODateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Se teu backend usa PUT em vez de PATCH, troque aqui.
async function atualizarLancamento(payload: {
  lancamentoId: number;
  descricao?: string;
  valor?: number;
  dtLancamento?: string; // ✅ "YYYY-MM-DD"
  subGrupoId: number;
  fonteId?: number;
  fonteIdD?: number | null;
}): Promise<tyResult> {
  const token = getTokenFromCookie();
  if (!token)
    return { status: "Erro", menssagem: "Token não encontrado. Faça login novamente." };

  const res = await fetch(
    `${getApiBaseUrl()}/api/private/restrita/lancamentos/${payload.lancamentoId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) return { status: "Erro", menssagem: pickApiErrorMessage(data) };

  return { status: "Sucesso", menssagem: "Lançamento alterado com sucesso!" };
}

export default function EditaLancamento({
  pItem,
  pIndice,
  isEdita,
  setIsEdita,
}: Props) {
  const { periodoId } = useGlobalContext();
  const queryClient = useQueryClient();

  const {
    grupoId,
    subGrupoId,
    fonteId,

    formGrupoId,
    setFormGrupoId,
    formSubGrupoId,
    setFormSubGrupoId,
    formFonteIdO,
    setFormFonteIdO,
    formFonteIdD,
    setFormFonteIdD,
    operacao,
    setOperacao,
  } = useLancamentoContext();

  const [showAlerta, setShowAlerta] = useState(false);
  const [tipo, setTipo] = useState<tipoEnu>(tipoEnu.Alerta);
  const [mensagem, setMensagem] = useState("Mensagem");
  const [closeOnAlertOk, setCloseOnAlertOk] = useState(false);

  const initialDate = useMemo(() => {
    return parseApiDateToLocalNoon(pItem?.dtLancamento);
  }, [pItem?.dtLancamento]);

  const [selDate, setSelDate] = useState<Date>(initialDate);

  const firstDayOfMonth = useMemo(() => startOfMonth(selDate), [selDate]);
  const lastDayOfMonth = useMemo(() => endOfMonth(selDate), [selDate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: pItem?.descricao ?? "",
      valor: DoubleToRealBR(pItem?.valor ?? 0),
      dtLancamento: initialDate,
    },
  });

  useEffect(() => {
    if (!isEdita) return;
    if (!pItem) return;

    if (typeof pItem.grupoId === "number") setFormGrupoId(pItem.grupoId);
    if (typeof pItem.subGrupoId === "number") setFormSubGrupoId(pItem.subGrupoId);

    if (typeof pItem.fonteId === "number") setFormFonteIdO(pItem.fonteId);
    if (typeof pItem.fonteIdD === "number") setFormFonteIdD(pItem.fonteIdD);
    else setFormFonteIdD(null);

    const op = normalizeOperacao((pItem as unknown as { operacao?: unknown }).operacao);
    setOperacao(op);

    const d = parseApiDateToLocalNoon(pItem.dtLancamento);
    setSelDate(d);

    form.reset({
      descricao: pItem.descricao ?? "",
      valor: DoubleToRealBR(pItem.valor ?? 0),
      dtLancamento: d,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdita, pItem?.lancamentoId]);

  const closeAll = () => {
    setCloseOnAlertOk(false);
    setIsEdita(false);
    setShowAlerta(false);
    form.reset();
  };

  const handleFecharWarning = () => {
    setShowAlerta(false);

    if (closeOnAlertOk) {
      setCloseOnAlertOk(false);
      closeAll();
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!pItem?.lancamentoId) {
      setTipo(tipoEnu.Erro);
      setMensagem("Lançamento inválido para edição.");
      setShowAlerta(true);
      return;
    }

    if (formGrupoId <= 0) {
      setTipo(tipoEnu.Alerta);
      setMensagem("Conta (Grupo) inválida.");
      setShowAlerta(true);
      return;
    }

    if (formSubGrupoId <= 0) {
      setTipo(tipoEnu.Alerta);
      setMensagem("É necessário selecionar uma Sub-Conta (SubGrupo).");
      setShowAlerta(true);
      return;
    }

    if (formFonteIdO <= 0) {
      setTipo(tipoEnu.Alerta);
      setMensagem("É necessário selecionar a Fonte (origem).");
      setShowAlerta(true);
      return;
    }

    const op: OperacaoLancamento = normalizeOperacao(operacao);

    if (op === "T") {
      if (!formFonteIdD || formFonteIdD <= 0) {
        setTipo(tipoEnu.Alerta);
        setMensagem("Para Transferência (T), selecione também a Fonte de destino.");
        setShowAlerta(true);
        return;
      }
      if (formFonteIdD === formFonteIdO) {
        setTipo(tipoEnu.Alerta);
        setMensagem("Fonte de origem e destino não podem ser iguais.");
        setShowAlerta(true);
        return;
      }
    }

    const valorNumber = RealBRToDouble(values.valor);
    if (!Number.isFinite(valorNumber) || valorNumber <= 0) {
      setTipo(tipoEnu.Alerta);
      setMensagem("Valor inválido.");
      setShowAlerta(true);
      return;
    }

    const retorno = await atualizarLancamento({
      lancamentoId: pItem.lancamentoId,
      descricao: values.descricao,
      valor: valorNumber,
      // ✅ envia como "YYYY-MM-DD" (data pura)
      dtLancamento: toISODateOnly(values.dtLancamento),
      subGrupoId: formSubGrupoId,
      fonteId: formFonteIdO,
      fonteIdD: op === "T" ? (formFonteIdD ?? null) : null,
    });

    if (retorno.status === "Sucesso") {
      setCloseOnAlertOk(true);
      setTipo(tipoEnu.Sucesso);
      setMensagem(retorno.menssagem ?? "Lançamento alterado com sucesso!");
      setShowAlerta(true);

      // ✅ atualiza a tabela sem reload
      await queryClient.refetchQueries({
        queryKey: ["lancamentos"],
      });
      return;
    }

    setCloseOnAlertOk(false);
    setTipo(tipoEnu.Erro);
    setMensagem(retorno.menssagem ?? "Ocorreu um erro inesperado.");
    setShowAlerta(true);
  };

  const opChip = operacaoLabel(normalizeOperacao(operacao));

  return (
    <>
      {showAlerta && (
        <WarningBox tipo={tipo} mensagem={mensagem} onCancel={handleFecharWarning} />
      )}

      <Dialog open={isEdita} onOpenChange={setIsEdita}>
        <DialogContent
          className={[
            "bg-white text-sky-900",
            "p-0 overflow-hidden",
            "w-[95vw] sm:max-w-[980px]",
            "h-[88vh] sm:h-auto sm:max-h-[86vh]",
            "flex flex-col",
          ].join(" ")}
        >
          {/* Header fixo */}
          <div className="shrink-0 p-6 pb-4">
            <DialogHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl font-bold leading-tight">
                    Editar Lançamento
                  </DialogTitle>
                  <DialogDescription className="text-sky-700">
                    Ajuste os dados do lançamento selecionado
                  </DialogDescription>
                </div>

                <div className="shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                  {opChip}
                </div>
              </div>
            </DialogHeader>
          </div>

          <Separator className="shrink-0" />

          {/* Body scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-5">
            <div className="space-y-6">
              {/* Conta e SubConta */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-700" />
                  <h3 className="font-semibold text-sky-900">Conta e Sub-Conta</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="pointer-events-none opacity-60">
                    <Label className="text-sky-900">Conta</Label>
                    <ComboGrupos pai="Form" />
                  </div>

                  <div>
                    <Label className="text-sky-900">Sub-Conta</Label>
                    <ComboSubGrupos pai="Form" />
                  </div>
                </div>
              </section>

              <Separator />

              <Form {...form}>
                <form
                  id="form-edita-lancamento"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Descrição */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-700" />
                      <h3 className="font-semibold text-sky-900">Descrição</h3>
                    </div>

                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sky-900">Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              className="min-h-[90px] resize-none"
                              placeholder="Ex: Mercado, gasolina, aluguel..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>

                  <Separator />

                  {/* Valor e Data */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-700" />
                      <h3 className="font-semibold text-sky-900">Valor e Data</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="valor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-900">Valor</FormLabel>
                            <FormControl>
                              <Input
                                className="text-base h-11"
                                placeholder="Ex: 120,50"
                                inputMode="decimal"
                                {...field}
                                // ✅ auto-seleciona ao focar (facilita digitar por cima)
                                onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                  e.currentTarget.select();
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dtLancamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sky-900">Data</FormLabel>
                            <FormControl>
                              <DatePicker
                                selected={field.value}
                                onChange={(date) => {
                                  const d = date ?? new Date();
                                  // ✅ guarda sempre como meio-dia (anti dia-1)
                                  const safe = new Date(
                                    d.getFullYear(),
                                    d.getMonth(),
                                    d.getDate(),
                                    12,
                                    0,
                                    0
                                  );
                                  field.onChange(safe);
                                  setSelDate(safe);
                                }}
                                dateFormat="EEEE - dd/MMMM"
                                minDate={firstDayOfMonth}
                                maxDate={lastDayOfMonth}
                                closeOnScroll={true}
                                locale={ptBR}
                                showPopperArrow={false}
                                isClearable={false}
                                customInput={<DateInput />}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator />

                  {/* Fontes */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-700" />
                      <h3 className="font-semibold text-sky-900">Fonte</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-sky-900">Fonte (Origem)</Label>
                        <ComboFontes pai="FormO" />
                      </div>

                      {normalizeOperacao(operacao) === "T" ? (
                        <div>
                          <Label className="text-sky-900">Destino</Label>
                          <ComboFontes pai="FormD" />
                        </div>
                      ) : (
                        <div className="hidden sm:block" />
                      )}
                    </div>
                  </section>
                </form>
              </Form>
            </div>
          </div>

          <Separator className="shrink-0" />

          {/* Footer fixo */}
          <div className="shrink-0 p-6 pt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-sky-800 text-sky-900 hover:bg-sky-900 hover:text-sky-50"
              onClick={closeAll}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              form="form-edita-lancamento"
              className="bg-sky-800 text-white hover:bg-sky-900"
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
