"use client";

import { useState } from "react";
import { adjustStock } from "@/actions/shoe-actions";
import { Plus, Minus, Loader2 } from "lucide-react";

interface Variant {
  id: string;
  size: string;
  colorway: string;
  stock: number;
  minStockAlert: number;
}

export function StockAdjuster({ variants }: { variants: Variant[] }) {
  const [loadingVariantId, setLoadingVariantId] = useState<string | null>(null);

  const handleAdjust = async (variantId: string, delta: number) => {
    setLoadingVariantId(variantId);
    await adjustStock(variantId, delta);
    setLoadingVariantId(null);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const isOutOfStock = v.stock === 0;
        const isLow = v.stock > 0 && v.stock <= v.minStockAlert;
        const isLoading = loadingVariantId === v.id;

        return (
          <div
            key={v.id}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xs transition ${
              isOutOfStock
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : isLow
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Talla</span>
              <strong className="text-sm font-black leading-none">{v.size}</strong>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-0.5" />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isLoading || v.stock <= 0}
                onClick={() => handleAdjust(v.id, -1)}
                className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 disabled:opacity-30 transition"
                title="Descontar 1 par"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span
                className={`font-black text-sm min-w-[20px] text-center ${
                  isOutOfStock ? "text-rose-600" : isLow ? "text-amber-700" : "text-slate-900"
                }`}
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : v.stock}
              </span>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleAdjust(v.id, +1)}
                className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 disabled:opacity-30 transition"
                title="Añadir 1 par (+1 entrada inventario)"
              >
                <Plus className="w-3 h-3 text-emerald-600" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
