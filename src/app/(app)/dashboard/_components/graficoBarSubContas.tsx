// src/app/(app)/dashboard/_components/graficoBarSubContas.tsx
"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";

import { useDashboardContext } from "./contextDashboardProvider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function GraficoBarSubContas() {
  const { subContas, loading } = useDashboardContext();

  const labels = useMemo(() => subContas.map((x) => x.SubGrupo), [subContas]);
  const valores = useMemo(() => subContas.map((x) => x.valorReal), [subContas]);

  const data: ChartData<"bar", number[], string> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: valores,
          borderWidth: 1,
        },
      ],
    }),
    [labels, valores]
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Distribuição das Sub-Contas",
          color: "rgb(7 89 133)",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = typeof ctx.raw === "number" ? ctx.raw : 0;
              return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(v);
            },
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(2, 132, 199, 0.15)" } },
      },
    }),
    []
  );

  if (loading.subContas) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl border bg-white flex items-center justify-center text-slate-500">
        Carregando gráfico...
      </div>
    );
  }

  if (!subContas.length) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl border bg-white flex items-center justify-center text-slate-500">
        Selecione uma conta (grupo) para ver as sub-contas.
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-96">
      <Bar data={data} options={options} />
    </div>
  );
}
