"use client";

import { useState } from "react";
import { createCustomer, CreateCustomerInput } from "@/actions/customer-actions";
import { UserPlus, X, Loader2 } from "lucide-react";

export function NewCustomerModal({ onCreated }: { onCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCustomerInput>({
    documentType: "DNI",
    documentNumber: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    creditScore: "GOOD",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Por favor ingresa los nombres y apellidos del cliente");
      return;
    }
    if (!formData.phone.trim()) {
      setError("Por favor ingresa el número de celular o WhatsApp");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await createCustomer(formData);
    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
      setFormData({
        documentType: "DNI",
        documentNumber: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        creditScore: "GOOD",
      });
      if (onCreated) onCreated();
    } else {
      setError(res.error || "No se pudo registrar el cliente");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
      >
        <UserPlus className="w-4 h-4" />
        <span>Registrar Cliente</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Cliente</h3>
                <p className="text-xs text-slate-500">Datos personales rápidos</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Ej. Carlos"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Ej. Mendoza Silva"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Celular / WhatsApp */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Celular / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej. 987123456"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-bold"
                />
              </div>

              {/* DNI (Opcional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">DNI / Documento</label>
                  <span className="text-[10px] text-slate-400 italic">Opcional</span>
                </div>
                <input
                  type="text"
                  value={formData.documentNumber || ""}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  placeholder="Ej. 72849102 (opcional)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-mono"
                />
              </div>

              {/* Dirección domiciliaria (Opcional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Dirección Domiciliaria</label>
                  <span className="text-[10px] text-slate-400 italic">Opcional</span>
                </div>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ej. Av. Próceres 1420 (opcional)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              {/* Calificación Crediticia */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calificación Inicial</label>
                <select
                  value={formData.creditScore}
                  onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
                >
                  <option value="EXCELLENT">Puntual / Excelente</option>
                  <option value="GOOD">Bueno (Normal)</option>
                  <option value="REGULAR">Regular</option>
                  <option value="DEFICIENT">Riesgo / Moroso</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 shadow-xs transition"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
