"use client";

import { FileEditIcon } from "@/app/_components/iconsForm";
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table} from "@/components/ui/table";
import { useState } from "react";
import { tySaldo, tySomatoriasPeriodo } from "@/types/types";
import { RealBRToDouble, DoubleToRealBR } from "@/lib/formatacoes";
import FormSaldo from "./saldosForm";
import { useSaldoContext } from "./contextSaldosProvider";

export default function TabelaSaldo() {
  const { dados } = useSaldoContext();
  const [isEdita, setIsEdita] = useState<boolean>(false);
  const [indice, setIndice] = useState<number>(0);

  const handleEditFonte = async (posicao: number) => {
    setIndice(posicao);
    setIsEdita(true);
  };
  return (
    <div>
      <Table className="border-collapse border-spacing-0 w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Fonte
            </TableHead>
            <TableHead className=" bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Saldo Inicial
            </TableHead>
            <TableHead className=" bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Saldo Atual
            </TableHead>
            <TableHead className=" bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
              Tipo
            </TableHead>
            <TableHead className=" bg-sky-900 border-2 border-sky-700 text-center text-sky-50 text-lg">
              Editar
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dados.map((item: tySomatoriasPeriodo, index: number) => (
            <TableRow className ="hover:bg-slate-200" key={item.saldoId}> 
              <TableCell className="border-2 border-sky-900 text-sky-900 text-center w-[0.5%] text-lg">
                {item.Fonte}
              </TableCell>
              <TableCell className="border-2 border-sky-900 text-sky-900 text-center w-[0.5%] text-lg">
                {DoubleToRealBR(item.valorInicial || 0)}
              </TableCell>
              <TableCell className="border-2 border-sky-900 text-sky-900 text-center w-[0.5%] text-lg">
                {DoubleToRealBR(item.saldoAtual || 0)}
              </TableCell>
              <TableCell className="border-2 border-sky-900 text-center text-sky-900 w-[0.5%] text-lg">
                {item.Tipo}
              </TableCell>
              <TableCell className="border-2 border-sky-900 w-[0.5%]">
                <div className="flex gap-1 justify-center text-sky-800 ">
                  <Button
                    variant="ghost"
                    onClick={() => handleEditFonte(index)}
                  >
                    <FileEditIcon className="h-6 w-6" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* === Formulario para edição do saldo === */}
      {isEdita && (
        <FormSaldo 
          indice={indice} 
          isEdita={isEdita} 
          setIsEdita={setIsEdita} 
        />
      )}
      {/* =========================================== */}
    </div>
  );
}
