"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, BarChart3 } from "lucide-react";

interface MonthlyData {
  month: string;
  total: number;
  count: number;
}

export function MonthlyCollectionChart({ data }: { data: MonthlyData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = Math.max(...data.map((d) => d.total), 100);
  const totalInPeriod = data.reduce((acc, d) => acc + d.total, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <span>Evolución Mensual de Recaudaciones</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Cobranzas de cuotas en los últimos 6 meses</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block uppercase font-semibold">Total Periodo</span>
            <strong className="text-emerald-600 font-black text-sm">
              {formatCurrency(totalInPeriod)}
            </strong>
          </div>
        </div>

        {/* Chart Bars */}
        <div className="mt-8 pt-4">
          <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-slate-100">
            {data.map((item, idx) => {
              const heightPct = Math.max(8, Math.round((item.total / maxVal) * 100));
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none flex flex-col items-center">
                      <span>{formatCurrency(item.total)}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {item.count} cobros
                      </span>
                    </div>
                  )}

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        item.total > 0
                          ? isHovered
                            ? "bg-amber-500 shadow-md shadow-amber-500/30"
                            : "bg-slate-900"
                          : "bg-slate-200"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Label */}
                  <span
                    className={`text-[11px] font-semibold transition ${
                      isHovered ? "text-slate-900 font-bold" : "text-slate-500"
                    }`}
                  >
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-900" />
          <span>Meses regulares</span>
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span>Mes seleccionado</span>
        </span>
      </div>
    </div>
  );
}
