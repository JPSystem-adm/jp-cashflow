'use server'
import ExcelJS, { Style } from 'exceljs';
import { FormataDataISOString, DoubleToRealBR } from '@/lib/formatacoes';
import { tyLancamento } from '@/types/types';
import { Buffer } from 'buffer';
import {centroStyle, ladoEsquerdoStyle, moneyStyle, textoLongoStyle  } from '@/lib/estilosExcelJs';

export async function exportaTabelaServidor(tabela: tyLancamento[]): Promise<string> {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lançamentos');

    // Definir colunas
    worksheet.columns = [
      { header: 'ID', key: 'ID', width: 10, hidden: true},
      { header: 'Conta', key: 'Conta', width: 20},
      { header: 'SubConta', key: 'SubConta', width: 20 },
      { header: 'Descrição', key: 'Descricao', width: 30},
      { header: 'Valor', key: 'Valor', width: 20},
      { header: 'Fontes', key: 'Fontes', width: 20},
      { header: 'Data Lançamento', key: 'DtLancamento', width: 20},
    ];

    // Aplicar cor de fundo no cabeçalho
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF00' }, // Amarelo
      };
      cell.font = {name: 'Roboto', bold: true, color: { argb: 'FF000000' }  }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    });

    tabela.forEach(lancamento => {
      const row = worksheet.addRow({
        ID: lancamento.lancamentoId,
        Conta: lancamento.grupo,
        SubConta: lancamento.subGrupo,
        Descricao: lancamento.descricao,
        Valor: lancamento.valor,
        Fontes: lancamento.fontes,
        DtLancamento: FormataDataISOString(lancamento.dtLancamento || "", "dd/MM/yyyy"),
      });
      // Aplicar formatação a cada célula na linha
      row.getCell('ID').style = centroStyle;
      row.getCell('Conta').style = ladoEsquerdoStyle;
      row.getCell('SubConta').style = ladoEsquerdoStyle;
      row.getCell('Descricao').style = textoLongoStyle;
      row.getCell('Valor').style = moneyStyle;
      row.getCell('Fontes').style = textoLongoStyle;
      row.getCell('DtLancamento').style = centroStyle;

    });

    //Adicionar filtros automáticos as colunas
    worksheet.autoFilter = { from: 'A1', to: 'G1' };

    // Salvar a planilha em um Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    const base64 = Buffer.from(buffer).toString('base64');
    return base64

  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    throw new Error('Falha ao gerar o arquivo Excel');
  }
}
