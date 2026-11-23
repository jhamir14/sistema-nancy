"use client";

import { formatCurrency } from "@/lib/utils";
import { Footprints, Tag } from "lucide-react";

interface BrandItem {
  brand: string;
  pairs: number;
  invested: number;
}

export function BrandStockChart({ brands }: { brands: BrandItem[] }) {
  const maxPairs = Math.max(...brands.map((b) => b.pairs), 1);
  const totalPairs = brands.reduce((acc, b) => acc + b.pairs, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-amber-500" />
              <span>Inventario por Marcas</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Concentración de stock y capital físico</p>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {totalPairs} pares
          </span>
        </div>

        {brands.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No hay marcas registradas en almacén.</p>
        ) : (
          <div className="space-y-3.5 mt-4">
            {brands.slice(0, 5).map((b, idx) => {
              const pct = Math.round((b.pairs / maxPairs) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-500" />
                      <span>{b.brand}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-semibold">{b.pairs} pares</span>
                      <strong className="text-slate-900 font-bold">
                        {formatCurrency(b.invested)}
                      </strong>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
        Inversión calculada a precio de costo de compra mayorista.
      </p>
    </div>
  );
}
