"use client";

import { useState } from "react";
import { createShoe, CreateShoeInput, VariantInput } from "@/actions/shoe-actions";
import { Plus, X, Trash2, Loader2, Footprints, DollarSign } from "lucide-react";

export function NewShoeModal({ onCreated }: { onCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("Urbano / Casual");
  const [gender, setGender] = useState("UNISEX");
  const [imageUrl, setImageUrl] = useState("");
  const [cashPrice, setCashPrice] = useState<number | "">("");

  // Tallas dinámicas
  const [variants, setVariants] = useState<VariantInput[]>([
    { size: "38", colorway: "Estándar", stock: 2, minStockAlert: 1 },
    { size: "39", colorway: "Estándar", stock: 3, minStockAlert: 1 },
    { size: "40", colorway: "Estándar", stock: 3, minStockAlert: 1 },
    { size: "41", colorway: "Estándar", stock: 2, minStockAlert: 1 },
  ]);

  const addVariantRow = () => {
    setVariants([...variants, { size: "42", colorway: "Estándar", stock: 1, minStockAlert: 1 }]);
  };

  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantInput, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashPrice || Number(cashPrice) <= 0) {
      setError("Por favor ingresa el precio al contado");
      return;
    }

    setIsLoading(true);
    setError(null);

    const inputData: CreateShoeInput = {
      brand,
      model,
      category,
      gender,
      imageUrl: imageUrl.trim() || undefined,
      cashPrice: Number(cashPrice),
      purchasePrice: 0,
      creditPrice: Number(cashPrice),
      variants,
    };

    const res = await createShoe(inputData);
    setIsLoading(false);

    if (res.success) {
      setIsOpen(false);
      setBrand("");
      setModel("");
      setCashPrice("");
      setImageUrl("");
      if (onCreated) onCreated();
    } else {
      setError(res.error || "No se pudo registrar la zapatilla");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
      >
        <Plus className="w-4 h-4 text-amber-400" />
        <span>Registrar Zapatilla</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-amber-500" />
                  <span>Registrar Modelo de Zapatilla</span>
                </h3>
                <p className="text-xs text-slate-500">Catálogo, precio normal y stock por tallas</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
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

              {/* Marca y Modelo */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej. Nike, Adidas, Jordan..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ej. Air Force 1 '07..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-bold"
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
                    placeholder="Ej. Casual, Deportiva, Hype..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
                  >
                    <option value="UNISEX">Unisex</option>
                    <option value="MENS">Hombre</option>
                    <option value="WOMENS">Mujer</option>
                    <option value="KIDS">Niños</option>
                  </select>
                </div>
              </div>

              {/* Precio al Contado (PRECIO NORMAL) */}
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
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-black text-slate-900 text-base"
                  />
                </div>
                <span className="text-[11px] text-amber-800 mt-1 block">
                  Este es el precio base que se aplicará al vender al contado o financiar a crédito.
                </span>
              </div>

              {/* Imagen / Foto de la Zapatilla */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Foto del Modelo (URL de imagen - Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... o enlace de foto"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-mono"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px]">
                  <span className="text-slate-400 self-center">Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80"
                      )
                    }
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Air Force 1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80"
                      )
                    }
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Jordan Retro
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl(
                        "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600&auto=format&fit=crop&q=80"
                      )
                    }
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Adidas Forum
                  </button>
                </div>
              </div>

              {/* Variantes de Tallas y Stock */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Stock de Tallas Inicial ({variants.reduce((a, b) => a + Number(b.stock || 0), 0)} pares)
                  </span>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Talla</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="w-20">
                        <input
                          type="text"
                          required
                          value={v.size}
                          onChange={(e) => updateVariant(i, "size", e.target.value)}
                          placeholder="Talla"
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-bold text-center"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={v.colorway}
                          onChange={(e) => updateVariant(i, "colorway", e.target.value)}
                          placeholder="Color / Edición"
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <div className="w-16">
                        <input
                          type="number"
                          min="0"
                          required
                          value={v.stock}
                          onChange={(e) => updateVariant(i, "stock", e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="Pares"
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-center font-black text-amber-700"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariantRow(i)}
                        disabled={variants.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
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
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-2 shadow-xs transition"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Guardar Zapatilla</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
