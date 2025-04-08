"use client";

import { FileEditIcon } from "@/app/_components/iconsForm";
import { Button } from "@/components/ui/button";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table} from "@/components/ui/table";
import { useOrcamentoContext } from "./contextProvider";
import { useState } from "react";
import { tyOrcamento } from "@/types/types";
import FormOrcamento from "./OrcamentoForm";
import { RealBRToDouble, DoubleToRealBR } from "@/lib/formatacoes";

export default function TabelaOrcamento() {
  const { dados } = useOrcamentoContext();
  const [isEdita, setIsEdita] = useState<boolean>(false);
  const [indice, setIndice] = useState<number>(0);

  //Função para exibir o formulario de edição do subGrupo
  const handleEditSubGrupo = async (posicao: number) => {
    setIndice(posicao);
    setIsEdita(true);
  };

  return (
    <div>
      <Table className="border-collapse border-spacing-0 w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Grupo
            </TableHead>
            <TableHead className=" bg-sky-900 border-2 border-sky-700 text-sky-50 text-center text-lg">
              Valor
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
          {dados.map((item: tyOrcamento, index: number) => (
            <TableRow className="hover:bg-slate-200" key={item.orcamentoId}>
              <TableCell className="border-2 border-sky-900 text-sky-900 text-center w-[0.5%] text-lg">
                {item.nomeGrupo}
              </TableCell>
              <TableCell className="border-2 border-sky-900 text-sky-900 text-center w-[0.5%] text-lg">
                {DoubleToRealBR(item.valor || 0)}
              </TableCell>
              <TableCell className="border-2 border-sky-900 text-center text-sky-900 w-[0.5%] text-lg">
                {item.tipoGrupo}
              </TableCell>
              <TableCell className="border-2 border-sky-900 w-[0.5%]">
                <div className="flex gap-1 justify-center text-sky-800 ">
                  <Button
                    variant="ghost"
                    onClick={() => handleEditSubGrupo(index)}
                  >
                    <FileEditIcon className="h-6 w-6" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* === Formulario para edição do orcamento === */}
      {isEdita && (
        <FormOrcamento
          indice={indice}
          isEdita={isEdita}
          setIsEdita={setIsEdita}
        />
      )}
      {/* =========================================== */}
    </div>
  );
}
