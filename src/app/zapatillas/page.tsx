import { getShoes } from "@/actions/shoe-actions";
import { NewShoeModal } from "@/components/shoes/NewShoeModal";
import { StockAdjuster } from "@/components/shoes/StockAdjuster";
import { AddVariantModal } from "@/components/shoes/AddVariantModal";
import { EditShoeModal } from "@/components/shoes/EditShoeModal";
import { formatCurrency } from "@/lib/utils";
import { Footprints, Search, Layers, TrendingUp, AlertTriangle, PlusCircle, Filter } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ZapatillasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  let shoes = await getShoes(q);

  if (filter === "low_stock") {
    shoes = shoes.filter((s) => s.hasLowStock || s.totalStock === 0);
  }

  const totalPairs = shoes.reduce((acc, s) => acc + s.totalStock, 0);
  const totalInvested = shoes.reduce((acc, s) => acc + s.totalInvestedInStock, 0);
  const totalPotentialProfit = shoes.reduce((acc, s) => acc + s.potentialProfitCredit, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Footprints className="w-6 h-6 text-amber-500" />
            <span>Inventario y Catálogo de Zapatillas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Control de stock físico por tallas, costos de inversión y precios de venta al contado o a crédito.
          </p>
        </div>

        <NewShoeModal />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Pares en Almacén</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalPairs} pares</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{shoes.length} modelos listados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Dinero Invertido en Stock</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(totalInvested)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Capital físico disponible</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Ganancia Estimada a Crédito</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalPotentialProfit)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Margen potencial de financiamiento</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <form className="flex-1" method="GET">
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder="Buscar por marca, modelo o SKU..."
              className="w-full text-sm outline-hidden text-slate-800 placeholder-slate-400"
            />
          </form>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <Link
            href="/zapatillas"
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition ${
              !filter ? "bg-slate-900 text-white shadow-xs" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Todos los Modelos
          </Link>
          <Link
            href="/zapatillas?filter=low_stock"
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "low_stock"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stock Bajo / Agotados</span>
          </Link>
        </div>
      </div>

      {/* Shoes Grid */}
      {shoes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Footprints className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No se encontraron modelos</h4>
          <p className="text-xs text-slate-400 mt-1">
            Prueba ajustando el filtro de búsqueda o registra una nueva zapatilla.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shoes.map((shoe) => {
            return (
              <div
                key={shoe.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Shoe Photo Banner */}
                  {shoe.imageUrl ? (
                    <div className="relative w-full h-44 mb-3.5 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 group">
                      <img
                        src={shoe.imageUrl}
                        alt={`${shoe.brand} ${shoe.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                        {shoe.brand}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-28 mb-3.5 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400">
                      <Footprints className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[10px] font-medium">Sin foto registrada</span>
                    </div>
                  )}

                  {/* Brand & Category & Edit Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      {shoe.brand}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                        {shoe.category || "Urbana"}
                      </span>
                      <EditShoeModal shoe={shoe} />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mt-1 leading-snug">
                    {shoe.model}
                  </h3>

                  {shoe.sku && (
                    <p className="text-[10px] text-slate-400 mt-0.5">SKU: {shoe.sku}</p>
                  )}

                  {/* Stock Tallas con Ajustador Dinámico (+ / -) */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-700">
                        Stock por Tallas ({shoe.totalStock} pares):
                      </span>
                      <AddVariantModal shoeId={shoe.id} shoeTitle={`${shoe.brand} ${shoe.model}`} />
                    </div>

                    <StockAdjuster variants={shoe.variants} />
                  </div>

                  {/* Precio al Contado */}
                  <div className="mt-4 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Precio al Contado:</span>
                    <span className="font-black text-base text-slate-900 font-mono">
                      {formatCurrency(shoe.cashPrice)}
                    </span>
                  </div>
                </div>

                {/* Footer del Card */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Inversión: <strong className="text-slate-900">{formatCurrency(shoe.totalInvestedInStock)}</strong>
                  </div>

                  <Link
                    href={`/creditos?shoeId=${shoe.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dar a Crédito</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
