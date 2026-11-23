"use client";

import { useState } from "react";
import { Printer, MessageCircle, X, CheckCircle2, Copy, Check } from "lucide-react";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";

export interface ThermalReceiptData {
  receiptNumber: string;
  paymentDate: Date | string;
  amount: number;
  paymentMethod: string;
  referenceCode?: string | null;
  collectedBy?: string | null;
  customer: {
    firstName: string;
    lastName: string;
    documentNumber: string;
    phone: string;
  };
  operation: {
    code: string;
    type: "LOAN" | "CREDIT";
    installmentNumber: number;
    totalInstallments?: number;
    dueDate?: Date | string;
    remainingBalanceAfterPayment: number;
    itemDetails?: string; // e.g. "Nike Air Force 1 '07 (Talla 41)"
  };
}

export function ThermalReceiptModal({
  receipt,
  isOpen,
  onClose,
}: {
  receipt: ThermalReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [ticketWidth, setTicketWidth] = useState<"58mm" | "80mm">("80mm");

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabel = (m: string) => {
    switch (m) {
      case "CASH":
        return "Efectivo";
      case "DIGITAL_WALLET":
        return "Yape / Plin";
      case "BANK_TRANSFER":
        return "Transferencia Bancaria";
      default:
        return m;
    }
  };

  const formattedDate = new Date(receipt.paymentDate).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = new Date(receipt.paymentDate).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const remaining = Math.max(0, receipt.operation.remainingBalanceAfterPayment);
  const isFullyPaid = remaining <= 0.05;

  const waMessage = `🧾 *COMPROBANTE DE PAGO - SISTEMA NANCY*
Hola *${receipt.customer.firstName}*, adjuntamos el detalle de su pago:

📄 *Recibo N°:* ${receipt.receiptNumber}
📅 *Fecha:* ${formattedDate} ${formattedTime}
💰 *Monto Pagado:* ${formatCurrency(receipt.amount)}
💳 *Medio:* ${paymentMethodLabel(receipt.paymentMethod)} ${
    receipt.referenceCode ? `(Ref: ${receipt.referenceCode})` : ""
  }
🔖 *Operación:* ${receipt.operation.code} (Cuota #${receipt.operation.installmentNumber})
${receipt.operation.itemDetails ? `👟 *Detalle:* ${receipt.operation.itemDetails}\n` : ""}${
    isFullyPaid
      ? `🎉 *¡Felicidades! Esta operación ha sido LIQUIDADA en su totalidad.*`
      : `📌 *Saldo Restante:* ${formatCurrency(remaining)}`
  }

¡Muchas gracias por su preferencia y puntualidad! ✨`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(waMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Print Styles for thermal printer */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #thermal-ticket-container,
          #thermal-ticket-container * {
            visibility: visible;
          }
          #thermal-ticket-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Top bar with controls */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Formato:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
              <button
                onClick={() => setTicketWidth("58mm")}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  ticketWidth === "58mm" ? "bg-amber-500 text-slate-950" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                58 mm
              </button>
              <button
                onClick={() => setTicketWidth("80mm")}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  ticketWidth === "80mm" ? "bg-amber-500 text-slate-950" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                80 mm (Estándar)
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 bg-slate-100/70 flex justify-center">
          <div
            id="thermal-ticket-container"
            className={`bg-white p-6 shadow-sm border border-slate-200 text-black font-mono text-[11px] leading-tight space-y-3 ${
              ticketWidth === "58mm" ? "w-[240px]" : "w-[320px]"
            }`}
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-black">
              <div className="text-base font-black tracking-wider uppercase font-sans">
                SISTEMA NANCY
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-700">
                Préstamos & Créditos de Zapatillas
              </div>
              <div className="text-[9px] text-slate-600">
                Atención y Cobranzas Personalizadas
              </div>
            </div>

            {/* Receipt Number & Date */}
            <div className="text-center font-bold py-1 bg-slate-50 border border-slate-200">
              <div className="text-xs">RECIBO DE COBRANZA</div>
              <div className="text-sm font-black tracking-wide text-slate-900">
                {receipt.receiptNumber}
              </div>
            </div>

            <div className="space-y-1 pt-1 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Hora:</span>
                <span>{formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Cajero / Asesor:</span>
                <span className="font-semibold">{receipt.collectedBy || "Nancy"}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
              <div className="font-bold uppercase text-[10px] text-slate-500">
                DATOS DEL CLIENTE
              </div>
              <div className="font-bold text-xs">
                {receipt.customer.firstName} {receipt.customer.lastName}
              </div>
              <div className="flex justify-between text-[10px]">
                <span>DNI / Doc:</span>
                <span>{receipt.customer.documentNumber}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Teléfono:</span>
                <span>{receipt.customer.phone}</span>
              </div>
            </div>

            {/* Operation & Installment */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2">
              <div className="font-bold uppercase text-[10px] text-slate-500">
                CONCEPTO DE PAGO
              </div>
              <div className="flex justify-between">
                <span>Operación:</span>
                <span className="font-bold">{receipt.operation.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span>
                  {receipt.operation.type === "LOAN" ? "Préstamo Efectivo" : "Crédito Calzado"}
                </span>
              </div>
              {receipt.operation.itemDetails && (
                <div className="text-[10px] text-slate-700 italic">
                  Detalle: {receipt.operation.itemDetails}
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Cuota Pagada:</span>
                <span>Cuota #{receipt.operation.installmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Medio de Pago:</span>
                <span>{paymentMethodLabel(receipt.paymentMethod)}</span>
              </div>
              {receipt.referenceCode && (
                <div className="flex justify-between text-[10px]">
                  <span>Voucher / Op:</span>
                  <span>{receipt.referenceCode}</span>
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="py-2 border-y-2 border-dashed border-black space-y-1">
              <div className="flex justify-between text-sm font-black">
                <span>TOTAL PAGADO:</span>
                <span>{formatCurrency(receipt.amount)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-700">
                <span>Saldo Pendiente:</span>
                <span>{formatCurrency(remaining)}</span>
              </div>
            </div>

            {/* Status Footer */}
            <div className="text-center pt-1 space-y-1">
              {isFullyPaid ? (
                <div className="text-[10px] font-bold text-emerald-800 border border-emerald-300 bg-emerald-50 p-1">
                  *** CRÉDITO CANCELADO AL 100% ***
                </div>
              ) : (
                <div className="text-[9px] text-slate-600">
                  Conserve este recibo como constancia de su pago.
                </div>
              )}
              <div className="text-[9px] text-slate-500 italic pt-1">
                ¡Gracias por su confianza y puntualidad!
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir en Ticketera</span>
            </button>

            {receipt.customer.phone && (
              <a
                href={generateWhatsAppUrl(receipt.customer.phone, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </a>
            )}
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg flex items-center justify-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡Texto copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar texto del recibo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
