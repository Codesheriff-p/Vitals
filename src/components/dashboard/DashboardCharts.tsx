"use client";

import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Canvas-drawn text can't use Tailwind's dark: variant, so this is a neutral
// gray with acceptable contrast against both the light and dark card surface.
const TICK_FONT = { family: "'IBM Plex Mono', monospace", size: 11, color: "#94a3b8" };

export default function DashboardCharts({
  statusBreakdown,
  monthlyRevenue,
}: {
  statusBreakdown: { status: string; total: number }[];
  monthlyRevenue: { month: string; total: number }[];
}) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:col-span-5 dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60 dark:text-white">
          Appointment Status Breakdown
        </h2>
        <Doughnut
          data={{
            labels: statusBreakdown.map((s) => s.status),
            datasets: [
              {
                // Kept aligned with the Badge status-tone palette used
                // elsewhere (success/danger/warning/info) — not the trace
                // brand accent, since these colors carry status meaning.
                data: statusBreakdown.map((s) => s.total),
                backgroundColor: ["#2e86c1", "#1e8449", "#c0392b", "#d68910"],
              },
            ],
          }}
          options={{ plugins: { legend: { position: "bottom", labels: { font: TICK_FONT, color: TICK_FONT.color } } } }}
        />
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] lg:col-span-7 dark:border-white/10 dark:bg-screen dark:shadow-black/20">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 before:content-[''] before:h-3.5 before:w-1 before:rounded-full before:bg-trace/60 dark:text-white">
          Revenue — Last 6 Months
        </h2>
        <Bar
          data={{
            labels: monthlyRevenue.map((m) => m.month),
            datasets: [{ label: "Revenue (₦)", data: monthlyRevenue.map((m) => m.total), backgroundColor: "#33e29a" }],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { font: TICK_FONT, color: TICK_FONT.color } },
              y: { beginAtZero: true, ticks: { font: TICK_FONT, color: TICK_FONT.color } },
            },
          }}
        />
      </div>
    </div>
  );
}
