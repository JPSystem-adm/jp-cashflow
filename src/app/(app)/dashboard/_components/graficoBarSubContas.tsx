'use client'

import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from "chart.js";
import { useDashboardContext } from "./contextDashboardProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function GraficoBarSubContas() {
  const { dadosBarSubContas } = useDashboardContext();

  const data = {
    labels: dadosBarSubContas.map((subGrupo) => subGrupo.SubGrupo),
    datasets: [
      {
        //label: "Total da conta",
        data: dadosBarSubContas.map((subGrupo) => subGrupo.valorReal),
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
        //backgroundColor: "rgba(252, 211, 77, 0.5)",
        //borderColor: "rgba(180, 83, 9, 1)",
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
        text: `Destribuição das Sub-Contas`,
      },
    },
  };

  return (
    <>
      <Bar data={data} options={options} className="flex max-h-96 min-w-[100%] text-sky-800" />
    </>
  );
}
