"use client";

import { useState } from "react";
import { createManualTransaction } from "@/actions/cash-actions";
import { PlusCircle, X, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function NewTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [category, setCategory] = useState("GASTO_OPERATIVO");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [registeredBy, setRegisteredBy] = useState("Administrador");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Ingresa un monto válido mayor a 0");
      return;
    }
    if (!description.trim()) {
      setError("Ingresa el motivo o descripción del movimiento");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await createManualTransaction({
      type,
      category,
      amount: Number(amount),
      description: description.trim(),
      registeredBy: registeredBy.trim(),
    });

    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
      setAmount("");
      setDescription("");
    } else {
      setError(res.error || "Ocurrió un error al registrar el movimiento");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
      >
        <PlusCircle className="w-4 h-4 text-amber-400" />
        <span>Registrar Movimiento Extra</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Nuevo Movimiento de Caja</h4>
                <p className="text-xs text-slate-500">Registra entradas o salidas manuales de efectivo</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-3 text-xs">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Selector de Tipo (Ingreso o Egreso) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType("INCOME");
                    setCategory("APORTE_CAPITAL");
                  }}
                  className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    type === "INCOME"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Ingreso (+)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType("EXPENSE");
                    setCategory("GASTO_OPERATIVO");
                  }}
                  className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    type === "EXPENSE"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Egreso / Gasto (-)</span>
                </button>
              </div>

              {/* Monto */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monto (S/) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-black text-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {type === "EXPENSE" ? (
                    <>
                      <option value="GASTO_OPERATIVO">Gasto Operativo (Movilidad, almuerzos, etc.)</option>
                      <option value="PAGO_SERVICIOS">Servicios (Luz, agua, internet, local)</option>
                      <option value="RETIRO_UTILIDADES">Retiro de Ganancias / Utilidades</option>
                      <option value="OTROS_GASTOS">Otros Egresos</option>
                    </>
                  ) : (
                    <>
                      <option value="APORTE_CAPITAL">Aporte / Inyección de Capital</option>
                      <option value="DEVOLUCION">Devolución o Reembolso</option>
                      <option value="OTROS_INGRESOS">Otros Ingresos Extra</option>
                    </>
                  )}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción / Detalle *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pasajes de cobranza, compra de útiles..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              {/* Responsable */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registrado Por</label>
                <input
                  type="text"
                  value={registeredBy}
                  onChange={(e) => setRegisteredBy(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              {/* Botones */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
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
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar en Caja</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
