"use client";

import { useState } from "react";
import { updateCustomer, CreateCustomerInput } from "@/actions/customer-actions";
import { Edit2, X, Loader2 } from "lucide-react";

interface CustomerData {
  id: string;
  documentType: string;
  documentNumber: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  address: string | null;
  creditScore: string;
  status: string;
}

export function EditCustomerModal({ customer }: { customer: CustomerData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateCustomerInput>>({
    documentType: customer.documentType || "DNI",
    documentNumber: customer.documentNumber || "",
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    address: customer.address || "",
    creditScore: customer.creditScore,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await updateCustomer(customer.id, {
      ...formData,
      documentNumber: formData.documentNumber?.trim() || null,
      address: formData.address?.trim() || null,
    });
    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
    } else {
      setError(res.error || "No se pudo actualizar el cliente");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
      >
        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
        <span>Editar Ficha</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Editar Datos del Cliente</h3>
                <p className="text-xs text-slate-500">
                  {customer.firstName} {customer.lastName}
                </p>
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
                  placeholder="Opcional"
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
                  placeholder="Opcional"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                />
              </div>

              {/* Calificación Crediticia */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Calificación</label>
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
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
