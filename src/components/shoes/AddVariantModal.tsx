"use client";

import { useState } from "react";
import { addVariantToShoe } from "@/actions/shoe-actions";
import { Plus, X, Loader2 } from "lucide-react";

export function AddVariantModal({
  shoeId,
  shoeTitle,
}: {
  shoeId: string;
  shoeTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [size, setSize] = useState("");
  const [colorway, setColorway] = useState("Estándar");
  const [stock, setStock] = useState<number>(1);
  const [minStockAlert, setMinStockAlert] = useState<number>(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!size.trim()) {
      setError("Ingresa la talla");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await addVariantToShoe(shoeId, {
      size: size.trim(),
      colorway: colorway.trim(),
      stock: Number(stock),
      minStockAlert: Number(minStockAlert),
    });

    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
      setSize("");
      setStock(1);
    } else {
      setError(res.error || "No se pudo agregar la talla");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Talla</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Agregar Talla</h4>
                <p className="text-[11px] text-slate-500 truncate max-w-[220px]">{shoeTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-3 text-xs">
              {error && (
                <div className="p-2 rounded bg-rose-50 text-rose-700 font-medium">{error}</div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Talla *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 37, 42, 8.5 US..."
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Color / Detalle</label>
                <input
                  type="text"
                  value={colorway}
                  onChange={(e) => setColorway(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alerta Mínima</label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Talla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
