"use client"

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useDashboardContext } from './contextDashboardProvider';
import { useGlobalContext } from '@/app/app/contextGlobal';
import { useEffect } from 'react';
import { RetEstatisticaEntradas } from '@/app/app/actions/graficosActions';


ChartJS.register(ArcElement, Tooltip, Legend);

export default function GraficoPizzaEntradas() {
  const { dadosPizzaEntradas, setDadosPizzaEntradas } = useDashboardContext();
  const { periodoId } = useGlobalContext();

  
  useEffect(() => {
    async function carregaDados() {
      const response = await RetEstatisticaEntradas(periodoId);
      setDadosPizzaEntradas(response);
    }
    
    if(periodoId){
      carregaDados();
    }
  },[periodoId, setDadosPizzaEntradas]);

  const data = {
    labels: dadosPizzaEntradas?.map(e => e.SubGrupo),
    datasets: [
      {
        data: dadosPizzaEntradas?.map(e => e.valorReal),
        backgroundColor: [
          'rgba(239, 68, 68, 0.6)',
          'rgba(168, 85, 247, 0.6)',
          'rgba(06, 182, 212, 0.6)',
          'rgba(132, 204, 22, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(217, 70, 239, 0.6)',
          'rgba(14, 165, 233, 0.6)',
          'rgba(34, 197, 94, 0.6)',
          'rgba(249, 115, 22, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(234, 179, 8, 0.6)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
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
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribuição das Entradas',
      },
    },
  }
  return <Pie data={data} options={options} />;
}