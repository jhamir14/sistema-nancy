"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { WhatsAppMessageModal, WhatsAppContextData } from "@/components/common/WhatsAppMessageModal";

export function CustomerWhatsAppButton({
  customerName,
  phone,
  totalActiveDebt,
  overdueCount,
  activeContractCode,
}: {
  customerName: string;
  phone: string;
  totalActiveDebt: number;
  overdueCount: number;
  activeContractCode?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const data: WhatsAppContextData = {
    customerName,
    phone,
    operationCode: activeContractCode || "GENERAL",
    operationType: "CREDIT",
    amountDue: totalActiveDebt,
    totalPendingBalance: totalActiveDebt,
    overdueDays: overdueCount > 0 ? overdueCount * 7 : 0,
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        title="Enviar mensaje con plantilla inteligente por WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </button>

      <WhatsAppMessageModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        data={data}
      />
    </>
  );
}
