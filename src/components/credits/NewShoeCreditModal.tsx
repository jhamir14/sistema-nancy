"use client";

import { useState } from "react";
import { createShoeCredit } from "@/actions/credit-actions";
import { formatCurrency } from "@/lib/utils";
import { PaymentFrequency } from "@/lib/types";
import { PlusCircle, X, Loader2, Footprints, Percent } from "lucide-react";

interface CustomerOption {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string | null;
  phone: string;
}

interface VariantOption {
  id: string;
  size: string;
  colorway: string;
  stock: number;
  shoe: {
    id: string;
    brand: string;
    model: string;
    cashPrice: number;
  };
}

export function NewShoeCreditModal({
  customers,
  variants,
  preselectedCustomerId,
}: {
  customers: CustomerOption[];
  variants: VariantOption[];
  preselectedCustomerId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState(preselectedCustomerId || (customers[0]?.id || ""));
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const [quantity, setQuantity] = useState<number | "">(1);
  const [downPayment, setDownPayment] = useState<number | "">("");
  const [interestRate, setInterestRate] = useState<number | "">(0);
  const [frequency, setFrequency] = useState<PaymentFrequency>("WEEKLY");
  const [installmentsCount, setInstallmentsCount] = useState<number | "">(4);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const qty = Number(quantity) || 1;
  const currentVariant = variants.find((v) => v.id === selectedVariantId);
  const normalPrice = currentVariant ? currentVariant.shoe.cashPrice * qty : 0;
  const initialAmount = Math.max(0, Number(downPayment) || 0);
  const baseFinanced = Math.max(0, normalPrice - initialAmount);
  const interestAmount = (baseFinanced * (Number(interestRate) || 0)) / 100;
  const totalFinanced = baseFinanced + interestAmount;
  const numInstallments = Number(installmentsCount) || 1;
  const amountPerInstallment = numInstallments > 0 ? (totalFinanced / numInstallments).toFixed(2) : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError("Selecciona un cliente");
      return;
    }
    if (!selectedVariantId) {
      setError("Selecciona una zapatilla del catálogo");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Ingresa una cantidad de pares válida");
      return;
    }
    if (!installmentsCount || Number(installmentsCount) <= 0) {
      setError("Ingresa un número de cuotas válido");
      return;
    }
    if (baseFinanced <= 0) {
      setError("La inicial no puede cubrir el monto total; para venta directa de contado usa otra modalidad.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await createShoeCredit({
      customerId,
      items: [{ shoeVariantId: selectedVariantId, quantity: Number(quantity) }],
      downPayment: initialAmount,
      interestRate: Number(interestRate) || 0,
      frequency,
      installmentsCount: Number(installmentsCount),
      startDate,
      notes: notes.trim() || undefined,
    });

    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
      setDownPayment("");
      setInterestRate(0);
      setNotes("");
    } else {
      setError(res.error || "No se pudo registrar el crédito de calzado");
    }
  };

  const frequencyLabel = frequency === "WEEKLY" ? "semanales" : frequency === "BIWEEKLY" ? "quincenales" : "mensuales";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
      >
        <PlusCircle className="w-4 h-4 text-amber-400" />
        <span>Nuevo Crédito de Zapatilla</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-amber-500" />
                  <span>Dar Calzado a Crédito</span>
                </h3>
                <p className="text-xs text-slate-500">Plan de pagos y entrega de zapatillas</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Selección de Cliente */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cliente *</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-amber-500 text-slate-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} {c.documentNumber ? `(${c.documentNumber})` : ""} - Tel: {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Zapatilla y Variante de Talla */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Zapatilla y Talla *
                  </label>
                  <select
                    required
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-amber-500 text-slate-900 text-xs"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.shoe.brand} {v.shoe.model} | T: {v.size} ({v.colorway}) - Precio: {formatCurrency(v.shoe.cashPrice)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cantidad (Pares)</label>
                  <input
                    type="number"
                    min="1"
                    max={currentVariant?.stock || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-center focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Precio Normal al Contado (Informativo) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Precio Normal del Calzado:</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {formatCurrency(normalPrice)}
                </span>
              </div>

              {/* Inicial e Intereses */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Inicial */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Inicial (S/.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">S/</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={downPayment}
                      onChange={(e) => setDownPayment(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 font-black text-emerald-700 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Pago entregado al inicio</span>
                </div>

                {/* Intereses */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Interés Adicional (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 font-black text-amber-700 text-sm focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {interestAmount > 0 ? `+S/ ${interestAmount.toFixed(2)} de interés` : "Sin recargo de interés"}
                  </span>
                </div>
              </div>

              {/* Frecuencia: SEMANALES, QUINCENALES O MENSUALES */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
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

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Número de Cuotas
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      required
                      value={installmentsCount}
                      onChange={(e) => setInstallmentsCount(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white font-bold text-center text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fecha de Entrega</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-amber-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Resumen de Amortización */}
                <div className="mt-2 p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Financiado:</span>
                    <strong className="text-blue-600 text-sm font-mono">{formatCurrency(totalFinanced)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-700 font-bold block">
                      {installmentsCount} cuotas {frequencyLabel} de:
                    </span>
                    <strong className="text-amber-600 text-base font-black font-mono">
                      {formatCurrency(Number(amountPerInstallment))}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Entregado con pasadores extra, cliente paga los fines de mes..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
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
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2 shadow-xs"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar Crédito</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
