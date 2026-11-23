"use client";

import { useState } from "react";
import { CollateralItem } from "@/actions/collateral-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Package,
  Clock,
  Phone,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Lock,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { WhatsAppMessageModal, WhatsAppContextData } from "@/components/common/WhatsAppMessageModal";

export function CollateralView({ initialItems }: { initialItems: CollateralItem[] }) {
  const [filter, setFilter] = useState<"ALL" | "IN_CUSTODY" | "READY_TO_RETURN" | "AT_RISK">("ALL");
  const [search, setSearch] = useState("");
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppContextData | null>(null);

  const filtered = initialItems.filter((item) => {
    const matchesFilter = filter === "ALL" || item.custodyStatus === filter;
    const term = search.toLowerCase();
    const matchesSearch =
      item.customer.fullName.toLowerCase().includes(term) ||
      (item.customer.documentNumber && item.customer.documentNumber.includes(term)) ||
      item.loanCode.toLowerCase().includes(term) ||
      item.collateralDescription.toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  const countInCustody = initialItems.filter((i) => i.custodyStatus === "IN_CUSTODY").length;
  const countReady = initialItems.filter((i) => i.custodyStatus === "READY_TO_RETURN").length;
  const countAtRisk = initialItems.filter((i) => i.custodyStatus === "AT_RISK").length;

  return (
    <div className="space-y-6">
      {/* Top Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === "ALL"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Todas ({initialItems.length})
          </button>

          <button
            onClick={() => setFilter("IN_CUSTODY")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filter === "IN_CUSTODY"
                ? "bg-amber-500 text-slate-950 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>En Custodia ({countInCustody})</span>
          </button>

          <button
            onClick={() => setFilter("READY_TO_RETURN")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filter === "READY_TO_RETURN"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Listas para Devolución ({countReady})</span>
          </button>

          <button
            onClick={() => setFilter("AT_RISK")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
              filter === "AT_RISK"
                ? "bg-rose-600 text-white shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>En Riesgo / Mora ({countAtRisk})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, prenda, código..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
          />
        </div>
      </div>

      {/* Grid of Collaterals */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Package className="w-12 h-12 mx-auto text-slate-300 mb-2 opacity-60" />
          <h4 className="font-bold text-slate-700 text-sm">No se encontraron prendas registradas</h4>
          <p className="text-xs text-slate-400 mt-1">
            Cuando registres un préstamo con garantía física, aparecerá en este almacén de custodia.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isReady = item.custodyStatus === "READY_TO_RETURN";
            const isAtRisk = item.custodyStatus === "AT_RISK";

            return (
              <div
                key={item.loanId}
                className={`bg-white rounded-2xl border shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition ${
                  isReady
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isAtRisk
                    ? "border-rose-200 bg-rose-50/20"
                    : "border-slate-200"
                }`}
              >
                <div>
                  {/* Top Status & Code */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.loanCode}
                    </span>

                    {isReady ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Lista para Devolver
                      </span>
                    ) : isAtRisk ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Mora ({item.overdueInstallments} cuotas)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <Lock className="w-3 h-3 text-amber-700" />
                        En Custodia
                      </span>
                    )}
                  </div>

                  {/* Prenda / Collateral Description */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Descripción de Prenda / Garantía:
                    </span>
                    <p className="font-bold text-slate-900 text-sm leading-snug">
                      {item.collateralDescription}
                    </p>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Dueño / Cliente:</span>
                      <Link
                        href={`/clientes/${item.customer.id}`}
                        className="font-bold text-slate-900 hover:text-amber-600 transition"
                      >
                        {item.customer.fullName}
                      </Link>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">DNI / Doc:</span>
                      <span className="font-mono">{item.customer.documentNumber}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Teléfono:</span>
                      <span className="font-bold text-slate-800">{item.customer.phone}</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 mt-2">
                      <span className="text-slate-400">Préstamo Otorgado:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {formatCurrency(item.principalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Saldo Pendiente:</span>
                      <span
                        className={`font-black font-mono text-sm ${
                          isReady ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(item.remainingDebt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
                  <Link
                    href={`/prestamos/${item.loanId}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Ver Préstamo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>

                  {item.customer.phone && (
                    <button
                      onClick={() =>
                        setWhatsAppData({
                          customerName: item.customer.fullName,
                          phone: item.customer.phone,
                          operationCode: item.loanCode,
                          operationType: "LOAN",
                          amountDue: item.remainingDebt,
                          totalPendingBalance: item.remainingDebt,
                          itemName: `Garantía: ${item.collateralDescription}`,
                        })
                      }
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="Contactar al cliente por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppMessageModal
        isOpen={!!whatsAppData}
        onClose={() => setWhatsAppData(null)}
        data={whatsAppData}
      />
    </div>
  );
}
