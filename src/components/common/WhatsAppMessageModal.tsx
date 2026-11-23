"use client";

import { useState } from "react";
import { MessageCircle, X, Copy, Check, Send, Sparkles, AlertTriangle, PartyPopper, Clock } from "lucide-react";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";

export interface WhatsAppContextData {
  customerName: string;
  phone: string;
  operationCode: string;
  operationType: "LOAN" | "CREDIT";
  installmentNumber?: number;
  amountDue?: number;
  dueDate?: Date | string;
  overdueDays?: number;
  totalPendingBalance?: number;
  itemName?: string;
}

export function WhatsAppMessageModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: WhatsAppContextData | null;
}) {
  const [templateType, setTemplateType] = useState<"PREVENTIVE" | "OVERDUE" | "LIQUIDATED" | "STATEMENT">("PREVENTIVE");
  const [customText, setCustomText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const formattedDueDate = data.dueDate ? formatDate(data.dueDate) : "pronto";
  const formattedAmount = data.amountDue ? formatCurrency(data.amountDue) : "S/ 0.00";
  const opLabel = data.operationType === "LOAN" ? "préstamo en efectivo" : "crédito de zapatillas";

  const templates = {
    PREVENTIVE: `👋 Hola *${data.customerName}*, te saludamos de *Sistema Nancy (Préstamos & Calzado)*.

Te recordamos cordialmente que tu cuota #${data.installmentNumber || 1} de tu ${opLabel} (*${data.operationCode}*) vence el próximo *${formattedDueDate}* por un monto de *${formattedAmount}*.

💳 *Medios de pago disponibles:*
• Efectivo en caja
• Yape / Plin
• Transferencia BCP / BBVA

¡Muchas gracias por tu compromiso y puntualidad! ✨`,

    OVERDUE: `⚠️ *AVISO DE CUOTA VENCIDA - SISTEMA NANCY*

Estimado(a) *${data.customerName}*, le escribimos para recordarle que su cuota #${data.installmentNumber || 1} de su ${opLabel} (*${data.operationCode}*) por el monto de *${formattedAmount}* se encuentra *VENCIDA*.

📅 Venció el: *${formattedDueDate}* ${
      data.overdueDays && data.overdueDays > 0 ? `(${data.overdueDays} días de retraso)` : ""
    }

Le solicitamos por favor regularizar su pago el día de hoy para mantener una excelente calificación y evitar recargos por mora.

📲 Si ya realizó el pago, por favor compártanos el comprobante por este medio. ¡Muchas gracias!`,

    LIQUIDATED: `🎉 *¡FELICITACIONES ${data.customerName.toUpperCase()}!*

Nos alegra informarte que tu ${opLabel} (*${data.operationCode}*) ha sido *CANCELADO Y LIQUIDADO EN SU TOTALIDAD*.

Agradecemos profundamente tu puntualidad, honestidad y confianza en nosotros. 🙌
🌟 ¡Tu línea de crédito queda abierta y renovada con trato preferencial para tu próximo préstamo o calzado deportivo! 👟💰`,

    STATEMENT: `📄 *ESTADO DE CUENTA - SISTEMA NANCY*

Hola *${data.customerName}*, te compartimos el resumen actualizado de tu cuenta:

🔖 *Operación:* ${data.operationCode} (${opLabel})
${data.itemName ? `👟 *Detalle:* ${data.itemName}\n` : ""}💰 *Saldo Pendiente Total:* ${formatCurrency(data.totalPendingBalance || data.amountDue || 0)}
📅 *Próximo Vencimiento:* ${formattedDueDate}
💵 *Monto de Cuota:* ${formattedAmount}

Cualquier consulta o para coordinar tu pago, estamos atentos a este chat. ¡Que tengas un excelente día! ✨`,
  };

  const currentMessage = customText || templates[templateType];

  const handleTemplateChange = (type: "PREVENTIVE" | "OVERDUE" | "LIQUIDATED" | "STATEMENT") => {
    setTemplateType(type);
    setCustomText(templates[type]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Plantillas Inteligentes de WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Cliente: <strong className="text-slate-800">{data.customerName}</strong> ({data.phone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => handleTemplateChange("PREVENTIVE")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
              templateType === "PREVENTIVE"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recordatorio Preventivo</span>
          </button>

          <button
            onClick={() => handleTemplateChange("OVERDUE")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
              templateType === "OVERDUE"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Cobranza / Mora</span>
          </button>

          <button
            onClick={() => handleTemplateChange("LIQUIDATED")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
              templateType === "LIQUIDATED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <PartyPopper className="w-3.5 h-3.5" />
            <span>Liquidación Total</span>
          </button>

          <button
            onClick={() => handleTemplateChange("STATEMENT")}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
              templateType === "STATEMENT"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estado de Cuenta</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Mensaje Personalizable (puedes editar el texto antes de enviar):
          </label>
          <textarea
            rows={10}
            value={customText || templates[templateType]}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 leading-relaxed"
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-2">
          <a
            href={generateWhatsAppUrl(data.phone, currentMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Send className="w-4 h-4" />
            <span>Abrir en WhatsApp</span>
          </a>

          <button
            onClick={handleCopy}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
