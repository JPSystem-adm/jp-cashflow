// src/app/(app)/dashboard/_components/graficoPizzaEntradas.tsx
"use client";

import { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";

import { useDashboardContext } from "./contextDashboardProvider";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GraficoPizzaEntradas() {
  const { entradas, loading } = useDashboardContext();

  const labels = useMemo(() => entradas.map((e) => e.SubGrupo), [entradas]);
  const valores = useMemo(() => entradas.map((e) => e.valorReal), [entradas]);

  const data: ChartData<"pie", number[], string> = useMemo(
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

  const options: ChartOptions<"pie"> = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Distribuição das Entradas" },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = typeof ctx.raw === "number" ? ctx.raw : 0;
              const brl = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(v);
              const lbl = typeof ctx.label === "string" ? ctx.label : "";
              return lbl ? `${lbl}: ${brl}` : brl;
            },
          },
        },
      },
    }),
    []
  );

  if (loading.entradas) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl border bg-white flex items-center justify-center text-slate-500">
        Carregando gráfico...
      </div>
    );
  }

  if (!entradas.length) {
    return (
      <div className="w-full h-72 sm:h-96 rounded-2xl border bg-white flex items-center justify-center text-slate-500">
        Sem dados de entradas para este período.
      </div>
    );
  }

  return (
    <div className="w-full h-72 sm:h-96">
      <Pie data={data} options={options} />
    </div>
  );
}
