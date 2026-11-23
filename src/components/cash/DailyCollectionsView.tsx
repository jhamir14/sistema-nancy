"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PaymentModal } from "@/components/payments/PaymentModal";
import {
  Bell,
  Calendar,
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Footprints,
  Banknote,
  Printer,
  Search,
  Filter,
  ArrowUpRight,
  User,
  Clock,
  Sparkles,
} from "lucide-react";

interface InstallmentDailyItem {
  id: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: Date | string;
  expectedAmount: number;
  paidAmount: number;
  penaltyAmount: number;
  remainingAmount: number;
  isToday: boolean;
  isOverdue: boolean;
  type: "LOAN" | "SHOE_CREDIT";
  code: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    documentNumber?: string | null;
    address?: string | null;
  } | null;
  itemDescription: string;
  whatsAppLink: string | null;
}

interface DailyCollectionsProps {
  date: Date | string;
  items: InstallmentDailyItem[];
  totalToCollectToday: number;
  totalOverdue: number;
  grandTotalPending: number;
  totalCollectedToday: number;
  countDueToday: number;
  countOverdue: number;
}

export function DailyCollectionsView({
  date,
  items,
  totalToCollectToday,
  totalOverdue,
  grandTotalPending,
  totalCollectedToday,
  countDueToday,
  countOverdue,
}: DailyCollectionsProps) {
  const [filterType, setFilterType] = useState<"ALL" | "TODAY" | "OVERDUE" | "LOAN" | "SHOE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstallment, setSelectedInstallment] = useState<any | null>(null);

  const formattedDate = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

  // Filtrado
  const filteredItems = items.filter((it) => {
    // Filtro por tipo o estado
    if (filterType === "TODAY" && !it.isToday) return false;
    if (filterType === "OVERDUE" && !it.isOverdue) return false;
    if (filterType === "LOAN" && it.type !== "LOAN") return false;
    if (filterType === "SHOE" && it.type !== "SHOE_CREDIT") return false;

    // Filtro por buscador
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = `${it.customer?.firstName} ${it.customer?.lastName}`.toLowerCase();
      const phone = it.customer?.phone?.toLowerCase() || "";
      const code = it.code.toLowerCase();
      const desc = it.itemDescription.toLowerCase();
      return name.includes(q) || phone.includes(q) || code.includes(q) || desc.includes(q);
    }

    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header con fecha y acción de imprimir PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Reporte Diario & Cobranzas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Cobranzas del Día
          </h1>
          <p className="text-sm text-slate-500 capitalize flex items-center gap-2 mt-0.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{formattedDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir / PDF del Día</span>
          </button>
        </div>
      </div>

      {/* 2. BANNER DE NOTIFICACIÓN DESTACADO PARA NANCY */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 p-5 text-slate-950 shadow-md border border-amber-400/40 relative overflow-hidden print:hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 text-slate-950 pointer-events-none">
          <Bell className="w-48 h-48" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 backdrop-blur-xs font-bold text-xs tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>AVISO DE COBRANZAS DE HOY</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              {countDueToday > 0 ? (
                <>Tienes {countDueToday} cliente{countDueToday > 1 ? "s" : ""} programado{countDueToday > 1 ? "s" : ""} para pagar hoy</>
              ) : (
                <>No hay cobros nuevos programados para hoy</>
              )}
            </h2>
            <p className="text-xs sm:text-sm font-medium opacity-90 max-w-2xl">
              {countDueToday > 0 ? (
                <>
                  Total programado para cobrar hoy: <strong>{formatCurrency(totalToCollectToday)}</strong>.
                  {countOverdue > 0 && (
                    <> Además tienes <strong>{countOverdue} cuota{countOverdue > 1 ? "s" : ""} vencida{countOverdue > 1 ? "s" : ""}</strong> de días anteriores ({formatCurrency(totalOverdue)}).</>
                  )}
                </>
              ) : countOverdue > 0 ? (
                <>Tienes <strong>{countOverdue} cuota{countOverdue > 1 ? "s" : ""} vencida{countOverdue > 1 ? "s" : ""}</strong> por un total de {formatCurrency(totalOverdue)}.</>
              ) : (
                <>¡Excelente! Todos los clientes están al día en sus cuotas hasta la fecha.</>
              )}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setFilterType("TODAY")}
              className="px-4 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 transition shadow-sm"
            >
              Ver Solo los de Hoy ({countDueToday})
            </button>
          </div>
        </div>
      </div>

      {/* 3. KPIS NUMÉRICOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Por Cobrar Hoy
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">
            {formatCurrency(totalToCollectToday)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {countDueToday} cuota{countDueToday !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Vencidos Anteriores
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
            {formatCurrency(totalOverdue)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {countOverdue} cuota{countOverdue !== 1 ? "s" : ""} en mora
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Cobrado Hoy
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
            +{formatCurrency(totalCollectedToday)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Recaudación del día</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total en Cartera
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
            {formatCurrency(grandTotalPending)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {items.length} cuotas pendientes
          </span>
        </div>
      </div>

      {/* 4. BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre, teléfono o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterType === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              onClick={() => setFilterType("TODAY")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterType === "TODAY"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Vence Hoy ({countDueToday})
            </button>
            <button
              onClick={() => setFilterType("OVERDUE")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterType === "OVERDUE"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Vencidos ({countOverdue})
            </button>
            <button
              onClick={() => setFilterType("LOAN")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterType === "LOAN"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Préstamos
            </button>
            <button
              onClick={() => setFilterType("SHOE")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterType === "SHOE"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Zapatillas
            </button>
          </div>
        </div>
      </div>

      {/* 5. VISTA DE IMPRESIÓN (ENCABEZADO SOLO PARA PRINT / PDF) */}
      <div className="hidden print:block mb-4 border-b-2 border-slate-900 pb-3">
        <h1 className="text-xl font-black text-slate-900">SISTEMA NANCY - REPORTE DE COBRANZAS DEL DÍA</h1>
        <p className="text-xs text-slate-600">Fecha del Reporte: {formattedDate}</p>
        <p className="text-xs text-slate-600">Total Programado: {formatCurrency(totalToCollectToday)} | Vencidos: {formatCurrency(totalOverdue)}</p>
      </div>

      {/* 6. LISTA DE CLIENTES QUE DEBEN PAGAR HOY */}
      {filteredItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
          <h3 className="text-base font-bold text-slate-800">No hay cobros pendientes</h3>
          <p className="text-xs text-slate-500 mt-1">
            No se encontraron clientes con cuotas pendientes para el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((it) => {
            const customerName = it.customer
              ? `${it.customer.firstName} ${it.customer.lastName}`
              : "Cliente no especificado";

            return (
              <div
                key={it.id}
                className={`bg-white rounded-2xl border transition p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-amber-400 ${
                  it.isOverdue
                    ? "border-rose-200 bg-rose-50/20"
                    : it.isToday
                    ? "border-amber-300 bg-amber-50/10"
                    : "border-slate-200"
                }`}
              >
                {/* Lado izquierdo: Datos del cliente y la operación */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        it.isOverdue
                          ? "bg-rose-100 text-rose-800"
                          : it.isToday
                          ? "bg-amber-100 text-amber-900 font-black"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {it.isOverdue ? (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>Vencido</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Vence Hoy</span>
                        </>
                      )}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        it.type === "LOAN"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                      }`}
                    >
                      {it.type === "LOAN" ? (
                        <Banknote className="w-3 h-3" />
                      ) : (
                        <Footprints className="w-3 h-3" />
                      )}
                      <span>{it.code}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-slate-500">
                      Cuota {it.installmentNumber} de {it.totalInstallments}
                    </span>
                  </div>

                  {/* Nombre y teléfono */}
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {customerName}
                    </h3>
                    {it.customer?.phone && (
                      <span className="text-xs text-slate-500 font-mono">
                        📞 {it.customer.phone}
                      </span>
                    )}
                  </div>

                  {/* Concepto / Producto */}
                  <p className="text-xs text-slate-600 font-medium">
                    {it.itemDescription}
                    {it.customer?.address && (
                      <span className="text-slate-400 ml-2">📍 {it.customer.address}</span>
                    )}
                  </p>
                </div>

                {/* Lado derecho: Monto a cobrar y botones de acción */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                      Monto a Cobrar
                    </span>
                    <strong className="text-xl font-black text-slate-900 font-mono">
                      {formatCurrency(it.remainingAmount)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 print:hidden">
                    {/* Botón WhatsApp */}
                    {it.whatsAppLink && (
                      <a
                        href={it.whatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    )}

                    {/* Botón Cobrar Ahora */}
                    <button
                      onClick={() => {
                        setSelectedInstallment({
                          id: it.id,
                          installmentNumber: it.installmentNumber,
                          dueDate: it.dueDate,
                          expectedAmount: it.expectedAmount,
                          paidAmount: it.paidAmount,
                          penaltyAmount: it.penaltyAmount,
                          status: it.isOverdue ? "OVERDUE" : "PENDING",
                          loan:
                            it.type === "LOAN"
                              ? {
                                  loanCode: it.code,
                                  customer: {
                                    firstName: it.customer?.firstName || "",
                                    lastName: it.customer?.lastName || "",
                                    phone: it.customer?.phone || "",
                                    documentNumber: it.customer?.documentNumber || "",
                                  },
                                }
                              : null,
                          shoeCredit:
                            it.type === "SHOE_CREDIT"
                              ? {
                                  creditCode: it.code,
                                  customer: {
                                    firstName: it.customer?.firstName || "",
                                    lastName: it.customer?.lastName || "",
                                    phone: it.customer?.phone || "",
                                    documentNumber: it.customer?.documentNumber || "",
                                  },
                                }
                              : null,
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Cobrar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de cobro rápido */}
      {selectedInstallment && (
        <PaymentModal
          installment={selectedInstallment}
          isOpen={true}
          onClose={() => setSelectedInstallment(null)}
        />
      )}
    </div>
  );
}
