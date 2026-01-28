// src/app/(app)/dashboard/_components/graficoBarDespesas.tsx
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

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function GraficoBarDespesas() {
  const { despesas, loading } = useDashboardContext();

  const labels = useMemo(() => despesas.map((d) => d.Grupo), [despesas]);
  const real = useMemo(() => despesas.map((d) => d.valorReal), [despesas]);
  const orcado = useMemo(() => despesas.map((d) => d.valorOrcado), [despesas]);

  const data: ChartData<"bar", number[], string> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Real",
          data: real,
          backgroundColor: "rgba(14, 165, 233, 0.75)",
          borderColor: "rgba(14, 165, 233, 1)",
          borderWidth: 1,
        },
        {
          label: "Orçado",
          data: orcado,
          backgroundColor: "rgba(245, 158, 11, 0.35)",
          borderColor: "rgba(245, 158, 11, 1)",
          borderWidth: 1,
        },
      ],
    }),
    [labels, real, orcado]
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        title: {
          display: true,
          text: "Totais das Despesas no Período",
          color: "rgb(7 89 133)",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = typeof ctx.raw === "number" ? ctx.raw : 0;
              return `${ctx.dataset.label}: ${formatBRL(v)}`;
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

  if (loading.despesas) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl border bg-white flex items-center justify-center text-slate-500">
        Carregando gráfico...
      </div>
    );
  }

  if (!despesas.length) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl border bg-white flex items-center justify-center text-slate-500">
        Sem dados de despesas para este período.
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-96">
      <Bar data={data} options={options} />
    </div>
  );
}
