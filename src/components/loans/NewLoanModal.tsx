"use client";

import { useState } from "react";
import { createLoan, CreateLoanInput } from "@/actions/loan-actions";
import { formatCurrency } from "@/lib/utils";
import { PaymentFrequency } from "@/lib/types";
import { Banknote, X, Loader2 } from "lucide-react";

interface CustomerOption {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber?: string | null;
  phone: string;
}

export function NewLoanModal({
  customers,
  preselectedCustomerId,
}: {
  customers: CustomerOption[];
  preselectedCustomerId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState(preselectedCustomerId || (customers[0]?.id || ""));
  const [principalAmount, setPrincipalAmount] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">(15); // 15% por defecto
  const [frequency, setFrequency] = useState<PaymentFrequency>("WEEKLY");
  const [installmentsCount, setInstallmentsCount] = useState<number | "">(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [collateral, setCollateral] = useState("");
  const [notes, setNotes] = useState("");

  const principal = Number(principalAmount) || 0;
  const rate = Number(interestRate) || 0;
  const totalInterest = (principal * rate) / 100;
  const totalAmount = principal + totalInterest;
  const numInstallments = Number(installmentsCount) || 1;
  const amountPerInstallment = numInstallments > 0 ? (totalAmount / numInstallments).toFixed(2) : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError("Selecciona un cliente");
      return;
    }
    if (!principalAmount || principalAmount <= 0) {
      setError("Ingresa un monto de préstamo válido");
      return;
    }
    if (!installmentsCount || Number(installmentsCount) <= 0) {
      setError("Ingresa un número de cuotas válido");
      return;
    }

    setIsLoading(true);
    setError(null);

    const inputData: CreateLoanInput = {
      customerId,
      principalAmount: Number(principalAmount),
      interestRate: Number(interestRate),
      frequency,
      installmentsCount: Number(installmentsCount),
      startDate,
      collateral: collateral || undefined,
      notes: notes || undefined,
    };

    const res = await createLoan(inputData);
    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
      setPrincipalAmount("");
      setCollateral("");
      setNotes("");
    } else {
      setError(res.error || "No se pudo registrar el préstamo");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition"
      >
        <Banknote className="w-4 h-4" />
        <span>Prestar Dinero</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-amber-500" />
                  <span>Nuevo Préstamo en Efectivo</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Desembolso con amortización en cuotas Semanales, Quincenales o Mensuales
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Selección de Cliente */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cliente Beneficiario *</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {c.documentNumber ? `(${c.documentNumber})` : ""} - Tel: {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capital e Interés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Capital Prestado (Desembolso) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ej. 500.00"
                    className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Egreso de caja en efectivo</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tasa de Interés (%) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      required
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-amber-700 focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex gap-1 shrink-0">
                      {[10, 15, 20].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setInterestRate(preset)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                        >
                          {preset}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FRECUENCIA DE CUOTAS: SEMANAL, QUINCENAL O MENSUAL */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">
                  Frecuencia de Pago y Plazo
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFrequency("WEEKLY");
                      setInstallmentsCount(4);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      frequency === "WEEKLY"
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs font-black">Semanales</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Cada 7 días</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFrequency("BIWEEKLY");
                      setInstallmentsCount(2);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      frequency === "BIWEEKLY"
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs font-black">Quincenales</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Cada 15 días</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFrequency("MONTHLY");
                      setInstallmentsCount(2);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      frequency === "MONTHLY"
                        ? "bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="text-xs font-black">Mensuales</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Cada 30 días</div>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Número de Cuotas ({frequency === "WEEKLY" ? "Semanas" : frequency === "BIWEEKLY" ? "Quincenas" : "Meses"})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      required
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fecha de Desembolso</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Prenda o Garantía */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prenda o Garantía Física (Opcional)
                  </label>
                  <input
                    type="text"
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    placeholder="Ej. Deja en custodia zapatillas Jordan 4 Retro talla 41"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Resumen Financiero en Vivo */}
                <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Total Interés:</span>
                    <strong className="text-emerald-600 text-sm">{formatCurrency(totalInterest)}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Total a Retornar:</span>
                    <strong className="text-slate-900 text-sm">{formatCurrency(totalAmount)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-amber-700 font-bold block">
                      {installmentsCount} cuotas de:
                    </span>
                    <strong className="text-amber-600 text-base font-black">
                      {formatCurrency(Number(amountPerInstallment))}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 shadow-sm"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Aprobar y Desembolsar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
