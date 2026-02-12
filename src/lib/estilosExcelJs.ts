// src/lib/estilosExcelJs.ts

import { Style } from 'exceljs';

/**
 * Este estilo coloca bordas nas celula
 * e define o fonte da celula como Roboto
 */
const padraoCelStyle: Partial<Style> = {
  font: {
    name: 'Roboto'
  },
  border: {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }
}

/**
 * Este estilo centraliza o texto 
 * na vertical e na horizontal
 */
const centralStyle: Partial<Style>  = {
  alignment: { 
    vertical: 'middle', 
    horizontal: 'center' 
  },
} 

/**
 * Este estilo centraliza o texto na vertical
 * mas alinha o texto a esquerda
 */
const esquerdoStyle: Partial<Style>  = {
  alignment: { 
    vertical: 'middle', 
    horizontal: 'left' 
  },
}

/** 
 * Este estilo centraliza o texto na vertical
 * mas alinha o texto a direita e formata 
 * o valor com duas casas decimais no formato
 * R$ ##,##0.00
*/
const realStyle: Partial<Style>  = {
  numFmt: 'R$ ##,##0.00',
  alignment: { 
    vertical: 'middle', 
    horizontal: 'right' 
  },
}

/**
 * Estilo para centralizar o texto na horizontal
 * se o texto for maior que a largura da celula, 
 * quebra de linha autamaticamente e alinha na 
 * parte superior da celula
 */
const textoStyle:Partial<Style> ={ 
  alignment: { 
    vertical: 'top', 
    horizontal: 'center', 
    wrapText: true 
  },
};

/** 
 * Este estilo atribui a celula com a seguite formatação:
 * Bordas, Fonte Roboto, Centraliza o texto na vertical e horizontal
*/
export const centroStyle = {
  ...padraoCelStyle,
  ...centralStyle,
}

/** 
 * Este estilo atribui a celula com a seguite formatação:
 * Bordas, Fonte Roboto, Centraliza o texto na vertical 
 * e alinha a esquerda na horizontal
*/
export const ladoEsquerdoStyle = {
  ...padraoCelStyle,
  ...esquerdoStyle,
}

/** 
 * Este estilo atribui a celula com a seguite formatação:
 * Bordas, Fonte Roboto, Centraliza o texto na vertical, 
 * alinha a esquerda na horizontal e aplica uma formatação
 * de duas casas decimais no formato R$ ##,##0.00
*/
export const moneyStyle = {
  ...padraoCelStyle,
  ...realStyle,
}

/** 
 * Este estilo atribui a celula com a seguite formatação:
 * Bordas, Fonte Roboto, centraliza o texto na horizontal 
 * e se o texto for maior que a largura da celula quebra de linha
*/
export const textoLongoStyle = {
  ...padraoCelStyle,
  ...textoStyle,
}