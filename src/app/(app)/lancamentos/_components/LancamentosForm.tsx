// src/app/(app)/lancamentos/_components/LancamentosForm.tsx

"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import { startOfMonth, endOfMonth } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import queryClient from "@/lib/reactQuery";

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

import { useGlobalContext } from "@/app/(app)/contextGlobal";
import { useLancamentoContext } from "@/app/(app)/lancamentos/_components/contextLancamentoProvider";

import ComboGrupos from "@/app/(app)/lancamentos/_components/querys/selectGrupos";
import ComboSubGrupos from "@/app/(app)/lancamentos/_components/querys/selectSubGrupos";
import ComboFontes from "@/app/(app)/lancamentos/_components/querys/selectFontes";

import { WarningBox, tipoEnu } from "@/app/(app)/_components/warningBox";

import { CriarLancamento } from "@/app/(app)/actions/lancamentoAPI";
import type {
  CriarLancamentoInput,
  OperacaoLancamento,
} from "@/app/(app)/actions/lancamentoAPI";

import {
  DoubleToRealBR,
  RealBRToDouble,
  retDataDoPeriodo,
} from "@/lib/formatacoes";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormValues = {
  descricao: string;
  valor: string;
  dtLancamento: Date;
};

// Regex BR
const moneyRegex =
  /^\d{1,3}(\.\d{3})*(,\d{0,2})?$|^\d+(,\d{0,2})?$/;

const schema = z.object({
  descricao: z.string().min(1, "Campo obrigatório!"),
  valor: z.string().regex(moneyRegex, "Valor monetário inválido"),
  dtLancamento: z.date(),
});

function operacaoLabel(op: OperacaoLancamento): string {
  return op === "T" ? "Transferência" : "Movimentação";
}

function toDateOnlyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // "YYYY-MM-DD"
}


export default function LancamentosForm({ open, onOpenChange }: Props) {
  const { periodoId, periodo } = useGlobalContext();

  const {
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

  const baseDate = useMemo(() => retDataDoPeriodo(periodo), [periodo]);
  const firstDayOfMonth = useMemo(() => startOfMonth(baseDate), [baseDate]);
  const lastDayOfMonth = useMemo(() => endOfMonth(baseDate), [baseDate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      descricao: "",
      valor: DoubleToRealBR(0),
      dtLancamento: baseDate,
    },
  });

  const closeAll = () => {
    setFormGrupoId(0);
    setFormSubGrupoId(0);
    setFormFonteIdO(0);
    setFormFonteIdD(null);
    setOperacao("M");

    form.reset({
      descricao: "",
      valor: DoubleToRealBR(0),
      dtLancamento: baseDate,
    });

    onOpenChange(false);
  };

  const handleFecharWarning = () => setShowAlerta(false);

  const onSubmit = async (values: FormValues) => {
    if (!periodoId || periodoId <= 0) {
      setTipo(tipoEnu.Erro);
      setMensagem("Período inválido. Recarregue a página.");
      setShowAlerta(true);
      return;
    }

    if (formGrupoId <= 0) {
      setTipo(tipoEnu.Alerta);
      setMensagem("É necessário selecionar uma Conta (Grupo).");
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
      setMensagem("É necessário selecionar a Fonte de origem.");
      setShowAlerta(true);
      return;
    }

    if (operacao === "T") {
      if (!formFonteIdD || formFonteIdD <= 0) {
        setTipo(tipoEnu.Alerta);
        setMensagem("Para Transferência, selecione também a Fonte de destino.");
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

    const valorNum = RealBRToDouble(values.valor);
    if (!Number.isFinite(valorNum) || valorNum <= 0) {
      setTipo(tipoEnu.Alerta);
      setMensagem("Informe um valor maior que zero.");
      setShowAlerta(true);
      return;
    }

    const payload: CriarLancamentoInput = {
      valor: valorNum,
      dtLancamento: toDateOnlyLocal(values.dtLancamento),
      operacao,
      periodoId,
      subGrupoId: formSubGrupoId,
      fonteId: formFonteIdO,
      fonteIdD: operacao === "T" ? (formFonteIdD ?? null) : null,
      descricao: values.descricao,
    };

    try {
      const retorno = await CriarLancamento(payload);

      // ✅ atualiza automaticamente a lista (sem reload)
      await queryClient.refetchQueries(["lancamentos"]);

      setTipo(tipoEnu.Sucesso);
      setMensagem(retorno.message);
      setShowAlerta(true);

      closeAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setTipo(tipoEnu.Erro);
      setMensagem(msg);
      setShowAlerta(true);
    }
  };

  const opChip = operacaoLabel(operacao);

  return (
    <>
      {showAlerta && (
        <WarningBox tipo={tipo} mensagem={mensagem} onCancel={handleFecharWarning} />
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={[
            // vira um "container flex" pra header/body/footer funcionarem
            "flex flex-col",
            "bg-white text-sky-900",
            "p-0 overflow-hidden",
            "w-[95vw] sm:max-w-[980px]",
            // altura fixa no mobile e limite no desktop
            "h-[88vh] sm:h-auto sm:max-h-[86vh]",
          ].join(" ")}
        >
          {/* HEADER (shrink-0) */}
          <div className="shrink-0 p-6 pb-4">
            <DialogHeader className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DialogTitle className="text-2xl font-bold leading-tight">
                    Novo Lançamento
                  </DialogTitle>
                  <DialogDescription className="text-sky-700">
                    Preencha os dados do lançamento financeiro
                  </DialogDescription>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                    {opChip}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={operacao === "M" ? "default" : "outline"}
                      className={operacao === "M" ? "bg-sky-800 hover:bg-sky-900" : "border-sky-300"}
                      onClick={() => {
                        setOperacao("M");
                        setFormFonteIdD(null);
                      }}
                    >
                      Mov.
                    </Button>

                    <Button
                      type="button"
                      variant={operacao === "T" ? "default" : "outline"}
                      className={operacao === "T" ? "bg-sky-800 hover:bg-sky-900" : "border-sky-300"}
                      onClick={() => setOperacao("T")}
                    >
                      Transf.
                    </Button>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          <Separator className="shrink-0" />

          {/* BODY (flex-1 min-h-0 => scroll funciona sem cortar footer) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-5">
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-700" />
                  <h3 className="font-semibold text-sky-900">Conta e Sub-Conta</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
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
                <form id="form-lancamento" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                className="text-base"
                                placeholder="Ex: 120,50"
                                inputMode="decimal"
                                {...field}
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
                              <div className="w-full">
                                <DatePicker
                                  selected={field.value}
                                  onChange={(date) => {
                                    if (date) field.onChange(date);
                                  }}
                                  dateFormat="EEEE - dd/MMMM"
                                  minDate={firstDayOfMonth}
                                  maxDate={lastDayOfMonth}
                                  locale={ptBR}
                                  showPopperArrow={false}
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sky-900"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator />

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

                      {operacao === "T" ? (
                        <div>
                          <Label className="text-sky-900">Fonte (Destino)</Label>
                          <ComboFontes pai="FormD" />
                        </div>
                      ) : (
                        <div className="hidden sm:block" />
                      )}
                    </div>

                    {operacao !== "T" ? (
                      <p className="text-xs text-sky-700">
                        * Para Transferência (T), escolha também uma Fonte de destino.
                      </p>
                    ) : null}
                  </section>
                </form>
              </Form>
            </div>
          </div>

          <Separator className="shrink-0" />

          {/* FOOTER (shrink-0) => sempre aparece */}
          <div className="shrink-0 flex flex-col gap-2 p-6 sm:flex-row sm:justify-end">
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
              form="form-lancamento"
              className="bg-sky-800 text-white hover:bg-sky-900"
            >
              Incluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
