"use client";

import { useGlobalContext } from "../contextGlobal";
import { VerificaPeriodo } from "@/app/app/actions/orcamentoActions";
import { retPeriodoAtual } from "@/lib/formatacoes";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function obterMesAno() {
  //const anoAtual = new Date().getFullYear();
  const anoAtual = 2023;
  const mesAno = [];
  for (let ano = anoAtual; ano <= anoAtual + 10; ano++) {
    for (let mes = 0; mes < meses.length; mes++) {
      mesAno.push(`${meses[mes]}/${ano}`);
    }
  }
  return mesAno;
}

export default function Periodo() {
  const { usuarioId, periodo, setPeriodo, periodoId, setPeriodoId } =
    useGlobalContext();

  useEffect(() => {
    const fetchData = async () => {
      if (periodoId < 1) {
        const atualPeriodo = retPeriodoAtual();
        const resultado = await VerificaPeriodo(usuarioId, atualPeriodo);
        setPeriodo(retPeriodoAtual());
        setPeriodoId(resultado.regId);
      }
    };
    fetchData();
  }, [periodoId, usuarioId, setPeriodo, setPeriodoId]);

  const onChange = async (value: string) => {
    const resultado = await VerificaPeriodo(usuarioId, value);
    if (resultado.status === "Sucesso") {
      setPeriodoId(resultado.regId);
      setPeriodo(value);
    }
    return true;
  };

  return (
    <div className="flex flex-row justify-center items-center">
      <div className="mr-2">
        <Label className="h-[40px] font-bold text-xl text-sky-50 flex items-center">
          Período Ativo
        </Label>
      </div>
      <div className="w-[250px]">
        <Select defaultValue={periodo} onValueChange={onChange}>
          <SelectTrigger className={`
            w-full 
            h-[40px] 
            text-xl flex 
            items-center`}>
            <SelectValue placeholder="Selecione o periodo" />
          </SelectTrigger>
          <SelectContent className={`
            //max-h-[500px] 
            //opacity-100 
            border-2 
            border-sky-950
            p-0 m-0 
            //bg-sky-100 
            //text-sky-900`}>
            <SelectGroup className={`
              //hover:bg-sky-900 
              //hover:text-sky-100 
              bg-white 
              text-sky-900`}>
              {obterMesAno().map((mesAno, index) => (
                <SelectItem
                  className="bg-sky-100 text-sky-900"
                  key={index}
                  value={mesAno}
                >
                  {mesAno}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
