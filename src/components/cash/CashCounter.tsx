"use client";

import { useState } from "react";
import { Calculator, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

interface CashCounterProps {
  expectedCash: number;
}

const DENOMINATIONS = [
  { label: "Billetes S/ 200", value: 200, type: "bill" },
  { label: "Billetes S/ 100", value: 100, type: "bill" },
  { label: "Billetes S/ 50", value: 50, type: "bill" },
  { label: "Billetes S/ 20", value: 20, type: "bill" },
  { label: "Billetes S/ 10", value: 10, type: "bill" },
  { label: "Monedas S/ 5", value: 5, type: "coin" },
  { label: "Monedas S/ 2", value: 2, type: "coin" },
  { label: "Monedas S/ 1", value: 1, type: "coin" },
  { label: "Monedas S/ 0.50", value: 0.5, type: "coin" },
];

export function CashCounter({ expectedCash }: CashCounterProps) {
  const [counts, setCounts] = useState<Record<number, number>>({
    200: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0,
    0.5: 0,
  });

  const handleCountChange = (val: number, countStr: string) => {
    const num = parseInt(countStr) || 0;
    setCounts((prev) => ({
      ...prev,
      [val]: Math.max(0, num),
    }));
  };

  const handleReset = () => {
    setCounts({
      200: 0,
      100: 0,
      50: 0,
      20: 0,
      10: 0,
      5: 0,
      2: 0,
      1: 0,
      0.5: 0,
    });
  };

  const totalCounted = DENOMINATIONS.reduce((acc, curr) => {
    return acc + curr.value * (counts[curr.value] || 0);
  }, 0);

  const difference = totalCounted - expectedCash;
  const isBalanced = Math.abs(difference) < 0.01;
  const isSurplus = difference > 0.01;
  const isDeficit = difference < -0.01;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Cuadre Rápido de Efectivo Físico</h3>
            <p className="text-xs text-slate-500">Conteo de billetes y monedas en gaveta</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {DENOMINATIONS.map((d) => {
            const count = counts[d.value] || 0;
            const subtotal = count * d.value;

            return (
              <div
                key={d.value}
                className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-700 block">{d.label}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    = S/ {subtotal.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={counts[d.value] || ""}
                  onChange={(e) => handleCountChange(d.value, e.target.value)}
                  placeholder="0"
                  className="w-16 px-2 py-1 text-center font-bold text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>
            );
          })}
        </div>

        {/* Comparison Result Banner */}
        <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
              Total Físico Contado
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              S/ {totalCounted.toFixed(2)}
            </div>
            <div className="text-xs text-slate-300">
              Esperado según sistema:{" "}
              <strong className="text-white">S/ {expectedCash.toFixed(2)}</strong>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
            {isBalanced ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Caja Cuadrada Exacta (Diferencia: S/ 0.00)</span>
              </div>
            ) : isSurplus ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-blue-400" />
                <span>Sobrante en Caja: +S/ {difference.toFixed(2)}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Faltante en Caja: -S/ {Math.abs(difference).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
