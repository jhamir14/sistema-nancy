"use client";

import { useState } from "react";
import { PaymentModal } from "./PaymentModal";
import { WhatsAppMessageModal, WhatsAppContextData } from "@/components/common/WhatsAppMessageModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { INSTALLMENT_STATUS_LABELS, InstallmentStatus } from "@/lib/types";
import { Receipt, Search, MessageCircle, AlertCircle, CheckCircle2, ChevronRight, Phone } from "lucide-react";

export function CobranzasView({
  initialInstallments,
  initialSearch = "",
}: {
  initialInstallments: any[];
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedInstallment, setSelectedInstallment] = useState<any | null>(null);
  const [whatsAppData, setWhatsAppData] = useState<WhatsAppContextData | null>(null);

  const filtered = initialInstallments.filter((inst) => {
    const customer = inst.loan?.customer || inst.shoeCredit?.customer;
    const code = inst.loan?.loanCode || inst.shoeCredit?.creditCode || "";
    const term = search.toLowerCase();

    if (!customer) return false;

    return (
      customer.firstName.toLowerCase().includes(term) ||
      customer.lastName.toLowerCase().includes(term) ||
      (customer.documentNumber && customer.documentNumber.includes(term)) ||
      customer.phone.includes(term) ||
      code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente, DNI, teléfono o código (PRE-..., CRZ-...)..."
          className="w-full text-xs sm:text-sm outline-hidden text-slate-800 placeholder-slate-400"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No hay cuotas pendientes para este criterio</h4>
          <p className="text-xs text-slate-400 mt-1">Todos los cobros están al día o no hay coincidencias.</p>
        </div>
      ) : (
        <>
          {/* VISTA MÓVIL: Tarjetas de cobranza táctiles */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((inst) => {
              const customer = inst.loan?.customer || inst.shoeCredit?.customer;
              const code = inst.loan?.loanCode || inst.shoeCredit?.creditCode;
              const isLoan = !!inst.loan;
              const frequency = isLoan ? inst.loan.frequency : inst.shoeCredit.frequency;
              const remaining = inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;

              const isOverdue = new Date(inst.dueDate) < new Date() && inst.status !== "PAID";
              const statusKey: InstallmentStatus = isOverdue ? "OVERDUE" : (inst.status as InstallmentStatus);
              const statusConfig = INSTALLMENT_STATUS_LABELS[statusKey] || INSTALLMENT_STATUS_LABELS.PENDING;

              return (
                <div
                  key={inst.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {customer?.firstName} {customer?.lastName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {code}
                        </span>
                        <span className="text-[11px] text-slate-400">• DNI: {customer?.documentNumber}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Cuota, Vencimiento y Monto */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Cuota #{inst.installmentNumber} ({frequency === "WEEKLY" ? "Semanal" : "Mensual"})
                      </span>
                      <span className={`text-xs font-semibold ${isOverdue ? "text-rose-600 font-bold" : "text-slate-700"}`}>
                        Vence: {formatDate(inst.dueDate)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Saldo por Cobrar:</span>
                      <span className="font-black text-base font-mono text-slate-900">
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Botones táctiles de Cobranza y WhatsApp */}
                  <div className="pt-1 flex items-center gap-2">
                    {customer?.phone && (
                      <button
                        onClick={() => {
                          const diffDays = Math.ceil(
                            (new Date().getTime() - new Date(inst.dueDate).getTime()) /
                              (1000 * 3600 * 24)
                          );
                          setWhatsAppData({
                            customerName: `${customer.firstName} ${customer.lastName}`,
                            phone: customer.phone,
                            operationCode: code || "",
                            operationType: isLoan ? "LOAN" : "CREDIT",
                            installmentNumber: inst.installmentNumber,
                            amountDue: remaining,
                            dueDate: inst.dueDate,
                            overdueDays: diffDays > 0 ? diffDays : 0,
                          });
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-emerald-200/60"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedInstallment(inst)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Cobrar Cuota</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISTA DESKTOP: Tabla completa para PC */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Operación / Cliente</th>
                    <th className="py-3.5 px-4">Cuota & Frecuencia</th>
                    <th className="py-3.5 px-4">Fecha Vencimiento</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Monto Cuota</th>
                    <th className="py-3.5 px-4">Saldo Pendiente</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((inst) => {
                    const customer = inst.loan?.customer || inst.shoeCredit?.customer;
                    const code = inst.loan?.loanCode || inst.shoeCredit?.creditCode;
                    const isLoan = !!inst.loan;
                    const frequency = isLoan ? inst.loan.frequency : inst.shoeCredit.frequency;
                    const remaining = inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;

                    const isOverdue = new Date(inst.dueDate) < new Date() && inst.status !== "PAID";
                    const statusKey: InstallmentStatus = isOverdue ? "OVERDUE" : (inst.status as InstallmentStatus);
                    const statusConfig = INSTALLMENT_STATUS_LABELS[statusKey] || INSTALLMENT_STATUS_LABELS.PENDING;

                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">
                            {customer?.firstName} {customer?.lastName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {code}
                            </span>
                            <span className="text-slate-400">• Doc: {customer?.documentNumber}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">
                            Cuota #{inst.installmentNumber}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {frequency === "WEEKLY" ? "Semanal" : "Mensual"} • {isLoan ? "Préstamo" : "Zapatillas"}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`font-semibold ${isOverdue ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                            {formatDate(inst.dueDate)}
                          </span>
                          {isOverdue && (
                            <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3" />
                              <span>Vencida</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {formatCurrency(inst.expectedAmount)}
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-black text-sm text-slate-900">
                            {formatCurrency(remaining)}
                          </span>
                          {inst.paidAmount > 0 && (
                            <span className="text-[10px] text-emerald-600 block">
                              Abonado: {formatCurrency(inst.paidAmount)}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {customer?.phone && (
                              <button
                                onClick={() => {
                                  const diffDays = Math.ceil(
                                    (new Date().getTime() - new Date(inst.dueDate).getTime()) /
                                      (1000 * 3600 * 24)
                                  );
                                  setWhatsAppData({
                                    customerName: `${customer.firstName} ${customer.lastName}`,
                                    phone: customer.phone,
                                    operationCode: code || "",
                                    operationType: isLoan ? "LOAN" : "CREDIT",
                                    installmentNumber: inst.installmentNumber,
                                    amountDue: remaining,
                                    dueDate: inst.dueDate,
                                    overdueDays: diffDays > 0 ? diffDays : 0,
                                  });
                                }}
                                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                                title="Plantillas Inteligentes de WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedInstallment(inst)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                            >
                              Cobrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal de Pago */}
      {selectedInstallment && (
        <PaymentModal
          installment={selectedInstallment}
          isOpen={!!selectedInstallment}
          onClose={() => setSelectedInstallment(null)}
        />
      )}

      {/* Modal de Plantillas WhatsApp */}
      <WhatsAppMessageModal
        isOpen={!!whatsAppData}
        onClose={() => setWhatsAppData(null)}
        data={whatsAppData}
      />
    </div>
  );
}
