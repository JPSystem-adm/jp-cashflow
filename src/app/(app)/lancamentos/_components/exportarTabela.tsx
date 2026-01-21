// src/app/(app)/lancamentos/_components/exportarTabela.tsx
"use client";

import { useState } from "react";
import { saveAs } from "file-saver";

import { Button } from "@/components/ui/button";
import { useLancamentoContext } from "./contextLancamentoProvider";
import { exportaTabelaServidor } from "@/app/(app)/actions/excel";
import { IconExcel } from "@/app/(app)/_components/iconsMenu";
import { FormataDataISOString } from "@/lib/formatacoes";

function base64ToUint8Array(base64: string): Uint8Array {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array<number>(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Uint8Array(byteNumbers);
}

function uint8ToArrayBuffer(u8: Uint8Array): ArrayBuffer {
  // Garante ArrayBuffer "puro" (evita ArrayBufferLike/SharedArrayBuffer nos tipos)
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

export default function ExportaTabela() {
  const { dados } = useLancamentoContext();
  const [loading, setLoading] = useState(false);

  const exportToExcel = async () => {
    setLoading(true);
    try {
      const base64 = await exportaTabelaServidor(dados);
      if (!base64) throw new Error("Falha ao exportar o Excel");

      const u8 = base64ToUint8Array(base64);
      const ab = uint8ToArrayBuffer(u8);

      const blob = new Blob([ab], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const nomeArq = FormataDataISOString(new Date().toISOString(), "yyyyMMdd_HHmmss");
      saveAs(blob, `Lancamentos_${nomeArq}.xlsx`);
    } catch (error) {
      console.error("Erro ao exportar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={exportToExcel}
      disabled={loading}
      className="h-11 bg-sky-800 text-white hover:bg-sky-900 disabled:opacity-70"
    >
      <IconExcel className={loading ? "w-5 h-5 mr-2 animate-spin" : "w-5 h-5 mr-2"} />
      {loading ? "Exportando..." : "Exportar Modelo"}
    </Button>
  );
}
