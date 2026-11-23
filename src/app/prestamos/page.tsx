import { getLoans } from "@/actions/loan-actions";

export const dynamic = "force-dynamic";
import { getCustomers } from "@/actions/customer-actions";
import { NewLoanModal } from "@/components/loans/NewLoanModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Banknote, User, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function PrestamosPage() {
  const [loans, customers] = await Promise.all([getLoans(), getCustomers()]);

  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const totalPrincipalActive = activeLoans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalInterestExpected = activeLoans.reduce((acc, l) => acc + l.totalInterest, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-amber-500" />
            <span>Préstamos en Efectivo</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de capital prestado, intereses pactados y cronograma de cuotas Semanales o Mensuales.
          </p>
        </div>

        <NewLoanModal
          customers={customers.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            documentNumber: c.documentNumber,
            phone: c.phone,
          }))}
        />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Préstamos Activos</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeLoans.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Histórico total: {loans.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Capital Prestado Activo</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(totalPrincipalActive)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Dinero entregado a clientes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Intereses por Recaudar</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalInterestExpected)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Ganancia neta esperada</span>
        </div>
      </div>

      {/* Loans List */}
      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No hay préstamos en efectivo registrados</h4>
          <p className="text-xs text-slate-400 mt-1">
            Haz clic en &quot;Prestar Dinero&quot; para registrar el primer desembolso.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((l) => {
            const isCompleted = l.status === "PAID";
            const totalPaid = l.installments.reduce((acc, i) => acc + i.paidAmount, 0);
            const remainingBalance = Math.max(0, l.totalAmount - totalPaid);
            const paidInstallments = l.installments.filter((i) => i.status === "PAID").length;

            return (
              <div
                key={l.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Info: Code & Customer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/prestamos/${l.id}`}
                      className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-black text-xs transition"
                      title="Ver detalle y cronograma"
                    >
                      {l.loanCode} &rarr;
                    </Link>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isCompleted ? "Liquidado / Pagado" : "Activo en Cobro"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Desembolsado: {formatDate(l.disbursementDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      {l.customer.firstName} {l.customer.lastName} ({l.customer.documentNumber})
                    </span>
                    <span className="text-xs font-normal text-slate-500">• Tel: {l.customer.phone}</span>
                  </div>

                  {l.collateral && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg w-fit">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Prenda / Garantía: <strong>{l.collateral}</strong></span>
                    </div>
                  )}
                </div>

                {/* Right Info: Financial Summary & Actions */}
                <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Capital + Interés ({l.interestRate}%)</span>
                    <span className="font-bold text-sm text-slate-900">
                      {formatCurrency(l.totalAmount)}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">
                      Ganancia: {formatCurrency(l.totalInterest)}
                    </span>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Progreso de Cuotas</span>
                    <span className="font-bold text-sm text-slate-800">
                      {paidInstallments} de {l.installmentsCount} cuotas (
                      {l.frequency === "WEEKLY" ? "Semanales" : "Mensuales"})
                    </span>
                    <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{
                          width: `${(paidInstallments / l.installmentsCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Saldo Pendiente</span>
                    <span className="font-black text-base text-rose-600">
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/prestamos/${l.id}`}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                    >
                      Ver Cronograma
                    </Link>
                    {!isCompleted && (
                      <Link
                        href={`/cobranzas?search=${l.loanCode}`}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition shadow-xs"
                      >
                        Abonar Cuota
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
