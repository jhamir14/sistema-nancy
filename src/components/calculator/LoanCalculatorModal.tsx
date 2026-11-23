"use client";

import { useState } from "react";
import { formatCurrency, formatDate, calculateDueDates } from "@/lib/utils";
import { PaymentFrequency } from "@/lib/types";
import { Calculator, X, Calendar, ArrowRight } from "lucide-react";

export function LoanCalculatorModal() {
  const [isOpen, setIsOpen] = useState(false);

  const [type, setType] = useState<"LOAN" | "CREDIT">("LOAN");
  const [amount, setAmount] = useState<number | "">(500);
  const [interestRate, setInterestRate] = useState<number | "">(15);
  const [downPayment, setDownPayment] = useState<number | "">(50);
  const [frequency, setFrequency] = useState<PaymentFrequency>("WEEKLY");
  const [installmentsCount, setInstallmentsCount] = useState<number | "">(4);

  // Cálculos en vivo
  let totalAmount = 0;
  let totalProfit = 0;
  let financedAmount = 0;

  const numAmount = Number(amount) || 0;
  const numRate = Number(interestRate) || 0;
  const numDown = Number(downPayment) || 0;
  const numCount = Number(installmentsCount) || 1;

  if (type === "LOAN") {
    totalProfit = (numAmount * numRate) / 100;
    totalAmount = numAmount + totalProfit;
    financedAmount = totalAmount;
  } else {
    totalAmount = numAmount;
    financedAmount = Math.max(0, numAmount - numDown);
    totalProfit = numAmount * 0.35; // Margen estimado
  }

  const amountPerInstallment = numCount > 0 ? financedAmount / numCount : 0;
  const projectedDates = calculateDueDates(new Date(), numCount, frequency);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
        title="Simulador de Cuotas"
      >
        <Calculator className="w-4 h-4 text-amber-500" />
        <span className="hidden sm:inline">Simulador</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  <span>Simulador Financiero de Cuotas</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Calcula cuotas semanales o mensuales y proyecta las fechas de vencimiento
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Selector de Tipo */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType("LOAN");
                    setAmount(500);
                  }}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    type === "LOAN"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Préstamo de Dinero
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("CREDIT");
                    setAmount(300);
                  }}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    type === "CREDIT"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Crédito de Zapatillas
                </button>
              </div>

              {/* Montos */}
              {type === "LOAN" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monto a Prestar</label>
                    <input
                      type="number"
                      step="10"
                      min="10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tasa Interés (%)</label>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm text-amber-700"
                      />
                      {[10, 15, 20].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setInterestRate(preset)}
                          className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[10px]"
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valor Zapatilla a Crédito</label>
                    <input
                      type="number"
                      step="10"
                      min="10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Enganche / Inicial</label>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm text-emerald-700"
                    />
                  </div>
                </div>
              )}

              {/* Frecuencia: Semanal, Quincenal o Mensual */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block text-xs">Frecuencia de Cuotas</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFrequency("WEEKLY");
                      setInstallmentsCount(4);
                    }}
                    className={`p-2 rounded-lg border text-center transition ${
                      frequency === "WEEKLY"
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-500"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-xs">Semanales</div>
                    <div className="text-[9px] opacity-80">Cada 7 días</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFrequency("BIWEEKLY");
                      setInstallmentsCount(2);
                    }}
                    className={`p-2 rounded-lg border text-center transition ${
                      frequency === "BIWEEKLY"
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-500"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-xs">Quincenales</div>
                    <div className="text-[9px] opacity-80">Cada 15 días</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFrequency("MONTHLY");
                      setInstallmentsCount(2);
                    }}
                    className={`p-2 rounded-lg border text-center transition ${
                      frequency === "MONTHLY"
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-500"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <div className="font-bold text-xs">Mensuales</div>
                    <div className="text-[9px] opacity-80">Cada 30 días</div>
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número de Cuotas ({frequency === "WEEKLY" ? "Semanas" : frequency === "BIWEEKLY" ? "Quincenas" : "Meses"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                  />
                </div>
              </div>

              {/* Resumen Proyectado */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">Total a Financiar:</span>
                  <strong className="text-white text-sm">{formatCurrency(financedAmount)}</strong>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                  <span className="text-amber-400 font-bold text-xs">
                    {installmentsCount} cuotas {frequency === "WEEKLY" ? "semanales" : "mensuales"} de:
                  </span>
                  <strong className="text-amber-400 text-xl font-black">
                    {formatCurrency(amountPerInstallment)}
                  </strong>
                </div>
              </div>

              {/* Proyección de Fechas */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-700 block text-xs">
                  Fechas Proyectadas de Pago:
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {projectedDates.map((date, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold text-slate-800">Cuota #{idx + 1}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600">{formatDate(date)}</span>
                        <strong className="text-slate-900 font-bold">
                          {formatCurrency(amountPerInstallment)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
