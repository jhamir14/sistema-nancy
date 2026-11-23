"use client";

import { useState } from "react";
import { registerPayment } from "@/actions/payment-actions";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";
import { Receipt, X, Loader2, MessageCircle, Printer, CheckCircle, FileText } from "lucide-react";
import { ThermalReceiptModal, ThermalReceiptData } from "./ThermalReceiptModal";

interface InstallmentItem {
  id: string;
  installmentNumber: number;
  dueDate: Date | string;
  expectedAmount: number;
  paidAmount: number;
  penaltyAmount: number;
  status: string;
  loan?: {
    loanCode: string;
    customer: { firstName: string; lastName: string; phone: string; documentNumber?: string | null };
  } | null;
  shoeCredit?: {
    creditCode: string;
    customer: { firstName: string; lastName: string; phone: string; documentNumber?: string | null };
  } | null;
}

export function PaymentModal({
  installment,
  isOpen,
  onClose,
}: {
  installment: InstallmentItem;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customer = installment.loan?.customer || installment.shoeCredit?.customer;
  const code = installment.loan?.loanCode || installment.shoeCredit?.creditCode;
  const isLoan = !!installment.loan;

  const remaining =
    installment.expectedAmount + installment.penaltyAmount - installment.paidAmount;

  const [amount, setAmount] = useState<number | "">(Number(remaining.toFixed(2)));
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceCode, setReferenceCode] = useState("");
  const [notes, setNotes] = useState("");

  // Resultado de pago para mostrar recibo
  const [completedPayment, setCompletedPayment] = useState<any | null>(null);
  const [showThermalTicket, setShowThermalTicket] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Ingresa un monto válido");
      return;
    }
    setIsLoading(true);
    setError(null);

    const res = await registerPayment({
      installmentId: installment.id,
      amount: Number(amount),
      paymentMethod,
      referenceCode: referenceCode || undefined,
      notes: notes || undefined,
    });

    setIsLoading(false);

    if (res.success && "payment" in res) {
      setCompletedPayment(res.payment);
    } else {
      setError(("error" in res && res.error) ? res.error : "Ocurrió un error al registrar el cobro");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Registrar Cobro de Cuota</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isLoan ? "Préstamo en Efectivo" : "Crédito de Zapatillas"} • {code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedPayment ? (
          /* RECIBO DE PAGO EMITIDO EXITOSAMENTE */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div>
              <span className="text-xs uppercase font-semibold text-emerald-700 tracking-wider">
                Cobro Exitoso
              </span>
              <h4 className="text-xl font-black text-slate-900">
                {formatCurrency(completedPayment.amount)}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Recibo N° <strong>{completedPayment.receiptNumber}</strong>
              </p>
            </div>

            {/* Ticket Preview */}
            <div
              id="printable-receipt"
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs font-mono space-y-1.5"
            >
              <div className="text-center font-bold font-sans text-sm pb-1 border-b border-dashed border-slate-300">
                SISTEMA NANCY
                <p className="text-[10px] text-slate-500 font-normal">Comprobante de Pago</p>
              </div>
              <div className="flex justify-between pt-1">
                <span>Cliente:</span>
                <span className="font-semibold">{customer?.firstName} {customer?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Doc:</span>
                <span>{customer?.documentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Operación:</span>
                <span className="font-bold">{code}</span>
              </div>
              <div className="flex justify-between">
                <span>Cuota:</span>
                <span>#{installment.installmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Método:</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-300 pt-1 font-bold">
                <span>Monto Pagado:</span>
                <span>{formatCurrency(completedPayment.amount)}</span>
              </div>
            </div>

            {/* Botones post-pago */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowThermalTicket(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Ver / Imprimir Ticket Térmico Oficial (58mm/80mm)</span>
              </button>

              <div className="flex gap-2">
                {customer?.phone && (
                  <a
                    href={generateWhatsAppUrl(
                      customer.phone,
                      `Hola ${customer.firstName}, confirmamos su pago de ${formatCurrency(
                        completedPayment.amount
                      )} para la cuota #${installment.installmentNumber} (${code}). Recibo: ${
                        completedPayment.receiptNumber
                      }. ¡Muchas gracias!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center transition"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Modal de Ticket Térmico */}
            {completedPayment && customer && (
              <ThermalReceiptModal
                isOpen={showThermalTicket}
                onClose={() => setShowThermalTicket(false)}
                receipt={{
                  receiptNumber: completedPayment.receiptNumber,
                  paymentDate: completedPayment.paymentDate || new Date(),
                  amount: completedPayment.amount,
                  paymentMethod: completedPayment.paymentMethod || paymentMethod,
                  referenceCode: completedPayment.referenceCode || referenceCode,
                  collectedBy: completedPayment.collectedBy || "Nancy",
                  customer: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    documentNumber: customer.documentNumber || "",
                    phone: customer.phone,
                  },
                  operation: {
                    code: code || "OPERACION",
                    type: isLoan ? "LOAN" : "CREDIT",
                    installmentNumber: installment.installmentNumber,
                    remainingBalanceAfterPayment: Math.max(0, remaining - completedPayment.amount),
                  },
                }}
              />
            )}
          </div>
        ) : (
          /* FORMULARIO DE COBRO */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Datos del Cliente y Cuota */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {customer?.firstName} {customer?.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Documento / Teléfono:</span>
                <span className="text-slate-700">{customer?.documentNumber} • {customer?.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cuota:</span>
                <span className="font-semibold text-slate-800">
                  #{installment.installmentNumber} (Vencía: {formatDate(installment.dueDate)})
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 pt-1">
                <span className="font-bold text-slate-700">Saldo Pendiente:</span>
                <span className="font-black text-rose-600 text-sm">{formatCurrency(remaining)}</span>
              </div>
            </div>

            {/* Monto a Cobrar */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monto a Cobrar *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max={remaining + 0.05}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 font-black text-slate-900 text-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setAmount(Number(remaining.toFixed(2)))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold"
                >
                  Cobro Total ({formatCurrency(remaining)})
                </button>
                {remaining > 20 && (
                  <button
                    type="button"
                    onClick={() => setAmount(Number((remaining / 2).toFixed(2)))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold"
                  >
                    50% Abono ({formatCurrency(remaining / 2)})
                  </button>
                )}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medio de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CASH">Efectivo</option>
                  <option value="DIGITAL_WALLET">Billetera Digital (Yape / Plin)</option>
                  <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">N° Operación / Voucher</label>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="Opcional"
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Pagado por familiar, billete de 100..."
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Botones */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-sm"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Confirmar Cobro e Ingresar a Caja</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
