// src/lib/formatacoes.ts

import { format, parseISO } from 'date-fns';
import { getDate } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

export function RealBRToDouble(value: string): number {
  let cleanedValue = value.replaceAll(".","");
  cleanedValue = cleanedValue.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleanedValue);
}

export function DoubleToRealBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function retPeriodoAtual(): string{
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",];
  const dataAtual = new Date();
  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();
  const mesAno = `${meses[mes]}/${ano}`;
  return mesAno;
}

export function retDataDoPeriodo(periodo: string){
  const partes = periodo.split('/');
  //const nomeMes = periodo.substring(0, periodo.length - 5)
  const nomeMes = partes[0];
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",];
  const mes = meses.indexOf(nomeMes);
  const dia = getDate(new Date())
  return new Date(Number(partes[1]), mes, dia)
}

/**
 * Esta função retorna a string do periodo anterior
 * @param periodo - O periodo que sera analizado, ex: Abril/2024.
 * @returns A string do periodo anterior, ex: Março/2024.
 */
export async function retPeriodoAnterior(periodo: string){
  const partes = periodo.split('/');
  const nomeMes = partes[0];
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",];
  const mes = meses.indexOf(nomeMes);
  let mesAnterior = "";
  let anoAnterior = 0;
  if(mes === 0){
    mesAnterior = "Dezembro"
    anoAnterior = Number(partes[1]) - 1;
  }else{
    mesAnterior = meses[mes - 1];
    anoAnterior = Number(partes[1]);
  }
  return (mesAnterior + "/" + anoAnterior)
}

//Converter uma data local para uma data UTC
//independente da Timezone
export function convertLocalDateToUTC(date: Date) {
  const timestamp = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );

  return new Date(timestamp);
}

//Converter uma data UTC para uma data Local
//independente da Timezone
export function convertUTCToLocalDate(utcDate: Date) {
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds(),
    utcDate.getUTCMilliseconds(),
  );
}

/**
 * Converte uma data no formato ISO String para o formato
 * informado em 'mascara'.
 * @param {string} dataISO - Data no formato ISO String
 * @param {string} mascara - Mascara para formatar a data
 * Ex: 'dd/MM/yyyy', 'dd/MM', 'dd/MMM', 'MM/yyyy', 'yyyy',  etc
 * @returns {string} Data formatada
 */
export function FormataDataISOString(dataISO: string, mascara: string): string {

  if (!dataISO) return ''; // Evita erro caso a data seja vazia



  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  let dataFormatada = "";

  if(timeZone === 'UTC') {
    dataFormatada = format(dataISO,  mascara, { locale: ptBR });
  }else{
     dataFormatada = formatInTimeZone(dataISO, timeZone, mascara, { locale: ptBR });
  }
   

  //console.log("DATAISO:", dataISO, dataFormatada);
  return dataFormatada;

}

/**
 * Converte uma data no fuso UTC para o formato ISO String, 
 * ajustando para o fuso horário local (UTC-DiferencaEmHoras)
 * @param {Date} dataUTC - Data no formato Date UTC
 * @returns {string} Data no formato ISO String
 */
export function FormataDataStringFusoLocal(dataUTC: Date): string {

  if (!dataUTC) return ''; // Evita erro caso a data seja vazia

  const dateUTC = new Date(dataUTC);
  dateUTC.setHours(dateUTC.getHours() + 3); // Ajuste o horário para corrigir a diferença de UTC x  America/Sao_Paulo
  
  return dateUTC.toISOString();
  
}

type dadosFuso = {
  timeZone: string;
  diferencaEmHoras: number; 
}

export function getFusoLocal():dadosFuso{
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  //Calcular a diferença de horas entre o fuso UTC e o local
  const agora = new Date(); // Pega a data e hora atuais
  const diferencaEmMinutos = agora.getTimezoneOffset(); // Diferença em minutos entre o local e o UTC
  const diferencaEmHoras = diferencaEmMinutos / 60; // Converte de minutos para horas


  return {timeZone: timeZone, diferencaEmHoras: diferencaEmHoras}

}

