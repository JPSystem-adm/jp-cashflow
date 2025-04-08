// src/app/dashboard/_components/graficoBarDespesas.tsx

"use client"

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from "chart.js";
import { useDashboardContext } from "./contextDashboardProvider";
import { useGlobalContext } from "@/app/app/contextGlobal";
import { useEffect } from "react";
import { RetEstatisticaDespesas } from "@/app/app/actions/graficosActions";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function GraficoBarDespesas() {
  const { dadosBarDespesas, setDadosBarDespesas } = useDashboardContext();
  const { periodoId } = useGlobalContext();

  
  useEffect(() => {
    async function carregaDados() {
      console.log("Periodo: ",periodoId);
      const response = await RetEstatisticaDespesas(periodoId);
      console.log("Response",response);
      setDadosBarDespesas(response);
    }
    
    if(periodoId){
      carregaDados();
    }
  },[periodoId, setDadosBarDespesas]);


  const data = {
    labels: dadosBarDespesas.map((despesa) => despesa.Grupo),
    datasets: [
      {
        label: "Valor Real",
        data: dadosBarDespesas.map((despesa) => despesa.valorReal),
        backgroundColor: [
          'rgba(168, 85, 247, 0.8)',
          'rgba(06, 182, 212, 0.8)',
          'rgba(132, 204, 22, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(217, 70, 239, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(06, 182, 212, 1)',
          'rgba(132, 204, 22, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(217, 70, 239, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(234, 179, 8, 1)',
        ], 
        borderWidth: 1,
      },
      {
        label: "Valor Orçado",
        data: dadosBarDespesas.map((despesa) => despesa.valorOrcado),
        backgroundColor: [
          'rgba(168, 85, 247, 0.2)',
          'rgba(06, 182, 212, 0.2)',
          'rgba(132, 204, 22, 0.2)',
          'rgba(245, 158, 11, 0.2)',
          'rgba(217, 70, 239, 0.2)',
          'rgba(14, 165, 233, 0.2)',
          'rgba(34, 197, 94, 0.2)',
          'rgba(249, 115, 22, 0.2)',
          'rgba(236, 72, 153, 0.2)',
          'rgba(59, 130, 246, 0.2)',
          'rgba(16, 185, 129, 0.2)',
          'rgba(234, 179, 8, 0.2)',
        ],
        borderColor: [
          'rgba(168, 85, 247, 1)',
          'rgba(06, 182, 212, 1)',
          'rgba(132, 204, 22, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(217, 70, 239, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(234, 179, 8, 1)',
        ], 
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "top" as const,
      },
      title: {
        color:'rgb(7 89 133)',
        display: true,
        text: "Totais das Despesas no Periodo",
      },
    },
  };
  return (
    <Bar data={data} options={options} className="flex max-h-96 min-w-[100%] text-sky-800" />
  );
}