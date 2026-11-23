"use client";

import { formatCurrency } from "@/lib/utils";
import { PieChart, Banknote, Footprints } from "lucide-react";

export function PortfolioDonutChart({
  loansAmount,
  creditsAmount,
}: {
  loansAmount: number;
  creditsAmount: number;
}) {
  const total = loansAmount + creditsAmount;
  const loansPct = total > 0 ? Math.round((loansAmount / total) * 100) : 50;
  const creditsPct = total > 0 ? 100 - loansPct : 50;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span>Distribución de Cartera Activa</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proporción de dinero en la calle por modalidad
            </p>
          </div>
          <span className="text-xs font-black text-slate-900">{formatCurrency(total)}</span>
        </div>

        {/* Visual Progress Bar Gauge */}
        <div className="space-y-3 mt-6">
          <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex p-1">
            <div
              className="bg-amber-500 h-full rounded-lg transition-all duration-500"
              style={{ width: `${loansPct}%` }}
              title={`Préstamos: ${loansPct}%`}
            />
            <div
              className="bg-slate-900 h-full rounded-lg transition-all duration-500 ml-1"
              style={{ width: `${creditsPct}%` }}
              title={`Zapatillas a Crédito: ${creditsPct}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <span className="text-amber-700">{loansPct}% Préstamos</span>
            <span className="text-slate-900">{creditsPct}% Crédito Zapatillas</span>
          </div>
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
              <Banknote className="w-4 h-4 text-amber-600" />
              <span>Préstamos</span>
            </div>
            <strong className="text-slate-900 text-sm block">{formatCurrency(loansAmount)}</strong>
            <span className="text-[10px] text-slate-500">Capital + Interés activo</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs mb-1">
              <Footprints className="w-4 h-4 text-amber-500" />
              <span>Zapatillas</span>
            </div>
            <strong className="text-slate-900 text-sm block">{formatCurrency(creditsAmount)}</strong>
            <span className="text-[10px] text-slate-500">Saldo financiado calzado</span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
        Actualizado en tiempo real según los cobros y nuevos créditos otorgados.
      </p>
    </div>
  );
}
