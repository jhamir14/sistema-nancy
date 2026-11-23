"use client";

import { useState } from "react";
import { PaymentModal } from "@/components/payments/PaymentModal";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";
import { INSTALLMENT_STATUS_LABELS, InstallmentStatus } from "@/lib/types";
import { CheckCircle2, MessageCircle, AlertCircle, Receipt } from "lucide-react";

interface InstallmentWithPayments {
  id: string;
  installmentNumber: number;
  dueDate: Date | string;
  expectedAmount: number;
  paidAmount: number;
  penaltyAmount: number;
  status: string;
  paidAt: Date | string | null;
  payments: {
    id: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
    paymentDate: Date | string;
  }[];
}

interface ParentContractInfo {
  code: string;
  type: "LOAN" | "CREDIT";
  customer: {
    firstName: string;
    lastName: string;
    documentNumber?: string | null;
    phone: string;
  };
}

export function AmortizationTable({
  installments,
  contractInfo,
}: {
  installments: InstallmentWithPayments[];
  contractInfo: ParentContractInfo;
}) {
  const [selectedInstallment, setSelectedInstallment] = useState<any | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Cronograma de Amortización</h4>
          <p className="text-xs text-slate-500">Detalle de cada cuota y sus fechas de vencimiento</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="py-3 px-4"># Cuota</th>
              <th className="py-3 px-4">Fecha Vencimiento</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Monto Cuota</th>
              <th className="py-3 px-4">Abonado</th>
              <th className="py-3 px-4">Saldo Pendiente</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {installments.map((inst) => {
              const remaining = inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
              const isOverdue = new Date(inst.dueDate) < new Date() && inst.status !== "PAID";
              const statusKey: InstallmentStatus = isOverdue
                ? "OVERDUE"
                : (inst.status as InstallmentStatus);
              const statusConfig =
                INSTALLMENT_STATUS_LABELS[statusKey] || INSTALLMENT_STATUS_LABELS.PENDING;

              const isPaid = inst.status === "PAID";

              const waMessage = `Hola ${contractInfo.customer.firstName}, le recordamos desde Nancy Calzado que su cuota #${inst.installmentNumber} (${contractInfo.code}) vence el ${formatDate(inst.dueDate)} por un monto de ${formatCurrency(remaining)}. ¡Muchas gracias!`;

              return (
                <tr key={inst.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Cuota #{inst.installmentNumber}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`font-semibold ${isOverdue ? "text-rose-600 font-bold" : "text-slate-800"}`}>
                      {formatDate(inst.dueDate)}
                    </span>
                    {inst.paidAt && (
                      <span className="text-[10px] text-emerald-600 block">
                        Pagado el {formatDate(inst.paidAt)}
                      </span>
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

                  <td className="py-3 px-4 text-emerald-600 font-semibold">
                    {inst.paidAmount > 0 ? formatCurrency(inst.paidAmount) : "-"}
                  </td>

                  <td className="py-3 px-4">
                    <span className={`font-black ${remaining > 0 ? "text-slate-900" : "text-emerald-600"}`}>
                      {remaining > 0 ? formatCurrency(remaining) : "Cancelado"}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isPaid && (
                        <>
                          <a
                            href={generateWhatsAppUrl(contractInfo.customer.phone, waMessage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                            title="Aviso por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedInstallment({
                                ...inst,
                                [contractInfo.type === "LOAN" ? "loan" : "shoeCredit"]: {
                                  [contractInfo.type === "LOAN" ? "loanCode" : "creditCode"]:
                                    contractInfo.code,
                                  customer: contractInfo.customer,
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition"
                          >
                            Cobrar
                          </button>
                        </>
                      )}

                      {isPaid && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Al día</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedInstallment && (
        <PaymentModal
          installment={selectedInstallment}
          isOpen={!!selectedInstallment}
          onClose={() => setSelectedInstallment(null)}
        />
      )}
    </div>
  );
}
