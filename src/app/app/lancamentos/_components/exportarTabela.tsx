"use client"
import { saveAs } from 'file-saver'; // Ou diretamente usar o Blob sem file-saver
import { useLancamentoContext } from './contextLancamentoProvider';
import { exportaTabelaServidor } from '@/app/app/actions/excel';
import { IconExcel } from "@/app/_components/iconsMenu";
import { FormataDataISOString } from '@/lib/formatacoes';
import { useState } from 'react';

export default function ExportaTabela() {
  const { dados } = useLancamentoContext();
  const [loading, setLoading] = useState(false);

  const exportToExcel = async () => {
    setLoading(true);
    try {
      
      // 1. Chama a função do servidor para gerar o arquivo Excel
      const base64 = await exportaTabelaServidor(dados);

      if (!base64) throw new Error('Falha ao exportar o Excel');

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 2. Converte o Buffer em Blob
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // 3. Gera o nome do arquivo
      const nomeArq = FormataDataISOString( new Date().toISOString(), "yyyyMMdd_HHmmss")

      // 3. Realiza o download do arquivo
      saveAs(blob,  `Lancamentos_${nomeArq}.xlsx`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row gap-4 mb-4">
      <button
        onClick={exportToExcel}
        className={`flex bg-sky-800 text-white px-4 py-2 rounded ${loading ? 'cursor-wait' : ''}`}
        disabled={loading}
      >
      {loading ? (
          <span className="flex items-center">
            <IconExcel className="w-6 h-6 mr-3 animate-spin" />
            <span>Exportando...</span>
          </span>
        ) : (
          <span className="flex items-center">
            <IconExcel className="w-6 h-6 mr-3" />
            <span>Exportar Modelo</span>
          </span>
        )}
      </button>
    </div>
  );
}


