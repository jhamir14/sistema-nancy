import { getUpcomingInstallments } from "@/actions/payment-actions";

export const dynamic = "force-dynamic";
import { CobranzasView } from "@/components/payments/CobranzasView";
import { formatCurrency } from "@/lib/utils";
import { Receipt, AlertTriangle, CalendarCheck } from "lucide-react";

export default async function CobranzasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; installmentId?: string }>;
}) {
  const { search } = await searchParams;
  const installments = await getUpcomingInstallments();

  const totalPendingMoney = installments.reduce(
    (acc, i) => acc + (i.expectedAmount + i.penaltyAmount - i.paidAmount),
    0
  );

  const overdueCount = installments.filter(
    (i) => new Date(i.dueDate) < new Date() && i.status !== "PAID"
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Módulo de Cobranzas y Caja</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de cobros de cuotas semanales y mensuales, emisión de tickets y comprobantes.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Cuotas Pendientes</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{installments.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Préstamos y calzado a crédito</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total por Recaudar</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalPendingMoney)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Saldo en cartera activa</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Cuotas Vencidas (Mora)</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{overdueCount} cuotas</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Requieren gestión inmediata</span>
        </div>
      </div>

      {/* Cobranzas Table with Interactive Payments */}
      <CobranzasView initialInstallments={installments} initialSearch={search} />
    </div>
  );
}
