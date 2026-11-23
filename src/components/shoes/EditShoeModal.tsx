"use client";

import { useState } from "react";
import { updateShoe } from "@/actions/shoe-actions";
import { Edit2, X, Loader2 } from "lucide-react";

interface ShoeData {
  id: string;
  brand: string;
  model: string;
  category: string | null;
  gender: string;
  imageUrl?: string | null;
  cashPrice: number;
}

export function EditShoeModal({ shoe }: { shoe: ShoeData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brand, setBrand] = useState(shoe.brand);
  const [model, setModel] = useState(shoe.model);
  const [category, setCategory] = useState(shoe.category || "");
  const [gender, setGender] = useState(shoe.gender);
  const [imageUrl, setImageUrl] = useState(shoe.imageUrl || "");
  const [cashPrice, setCashPrice] = useState<number | "">(shoe.cashPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashPrice || Number(cashPrice) <= 0) {
      setError("Ingresa un precio al contado válido");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await updateShoe(shoe.id, {
      brand,
      model,
      category,
      gender,
      imageUrl: imageUrl.trim() || undefined,
      cashPrice: Number(cashPrice),
    });

    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
    } else {
      setError(res.error || "No se pudo actualizar el calzado");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        title="Editar modelo"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Editar Modelo de Zapatilla</h3>
                <p className="text-xs text-slate-500">{shoe.brand} {shoe.model}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              {error && (
                <div className="p-2.5 rounded bg-rose-50 text-rose-700 font-medium">{error}</div>
              )}

              {/* Marca y Modelo */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Categoría y Género */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  >
                    <option value="UNISEX">Unisex</option>
                    <option value="MENS">Hombre</option>
                    <option value="WOMENS">Mujer</option>
                    <option value="KIDS">Niños</option>
                  </select>
                </div>
              </div>

              {/* Precio al Contado */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <label className="block font-bold text-amber-950 mb-1 text-xs">
                  Precio al Contado (Precio Normal) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={cashPrice}
                    onChange={(e) => setCashPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-200 bg-white font-black text-slate-900 text-base"
                  />
                </div>
              </div>

              {/* Foto / Imagen de la Zapatilla */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Foto del Modelo (URL de imagen)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />

                {/* Vista previa en vivo de la foto */}
                {imageUrl && (
                  <div className="mt-2.5 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-2 px-2 py-0.5 rounded bg-slate-900/70 text-[9px] font-bold text-white">
                      Vista Previa
                    </span>
                  </div>
                )}
              </div>

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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-2 shadow-xs"
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
