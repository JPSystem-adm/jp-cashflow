// src/app/(app)/dashboard/_components/graficoBarDespesas.tsx
"use client";

import { useEffect, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";

import { useDashboardContext } from "./contextDashboardProvider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type BarLabel = string;
type DatasetKey = "real" | "orcado";

function toNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function GraficoBarDespesas() {
  // ✅ agora vem tudo do provider (sem fetch aqui)
  const { despesas, loading } = useDashboardContext();

  // ✅ garante labels estáveis e números normalizados
  const { labels, valoresReal, valoresOrcado } = useMemo(() => {
    const lbls: string[] = [];
    const real: number[] = [];
    const orcado: number[] = [];

    for (const d of despesas) {
      lbls.push(String(d.Grupo ?? ""));
      real.push(toNumber(d.valorReal));
      orcado.push(toNumber(d.valorOrcado));
    }

    return { labels: lbls, valoresReal: real, valoresOrcado: orcado };
  }, [despesas]);

  // se quiser, pode manter logs (mas normalmente eu tiraria)
  useEffect(() => {
    // console.log("Despesas carregadas:", despesas.length);
  }, [despesas.length]);

  const data: ChartData<"bar", number[], BarLabel> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Real",
          data: valoresReal,
          backgroundColor: "rgba(14, 165, 233, 0.75)",
          borderColor: "rgba(14, 165, 233, 1)",
          borderWidth: 1,
        },
        {
          label: "Orçado",
          data: valoresOrcado,
          backgroundColor: "rgba(245, 158, 11, 0.35)",
          borderColor: "rgba(245, 158, 11, 1)",
          borderWidth: 1,
        },
      ],
    }),
    [labels, valoresReal, valoresOrcado]
  );

  const options: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "Totais das Despesas no Período",
          color: "rgb(7 89 133)",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = typeof ctx.raw === "number" ? ctx.raw : toNumber(ctx.raw);
              const brl = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(v);
              return `${ctx.dataset.label}: ${brl}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "rgb(7 89 133)",
            maxRotation: 0,
            autoSkip: true,
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: "rgb(7 89 133)",
            callback: (value) => {
              const v = typeof value === "number" ? value : toNumber(value);
              return new Intl.NumberFormat("pt-BR", {
                notation: "compact",
                compactDisplay: "short",
              }).format(v);
            },
          },
          grid: {
            color: "rgba(2, 132, 199, 0.15)",
          },
        },
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

  if (!despesas || despesas.length === 0) {
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
