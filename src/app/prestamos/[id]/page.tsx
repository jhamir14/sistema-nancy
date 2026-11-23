import { getLoanById } from "@/actions/loan-actions";
import { AmortizationTable } from "@/components/installments/AmortizationTable";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";
import {
  Banknote,
  User,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loan = await getLoanById(id);

  if (!loan) {
    notFound();
  }

  const isCompleted = loan.status === "PAID";
  const totalPaid = loan.installments.reduce((acc, i) => acc + i.paidAmount, 0);
  const remainingBalance = Math.max(0, loan.totalAmount - totalPaid);
  const paidCount = loan.installments.filter((i) => i.status === "PAID").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/prestamos"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-mono font-black text-sm">
                {loan.loanCode}
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Préstamo en Efectivo
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {isCompleted ? "Liquidado / Pagado" : "Activo en Cobro"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Desembolsado el {formatDate(loan.disbursementDate)} • Modalidad:{" "}
              {loan.frequency === "WEEKLY" ? "Cuotas Semanales" : "Cuotas Mensuales"}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Capital Desembolsado</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(loan.principalAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Salida de caja</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Interés ({loan.interestRate}%)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(loan.totalInterest)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Ganancia neta acordada</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total a Retornar</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(loan.totalAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Capital + Intereses</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Saldo Pendiente</span>
          <p
            className={`text-2xl font-black mt-1 ${
              remainingBalance > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(remainingBalance)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {paidCount} de {loan.installmentsCount} cuotas pagadas
          </span>
        </div>
      </div>

      {/* Grid: Customer Info & Amortization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 h-fit">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span>Cliente Beneficiario</span>
            </span>
            <Link
              href={`/clientes/${loan.customer.id}`}
              className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
            >
              Ver perfil &rarr;
            </Link>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Nombre Completo:</span>
              <strong className="text-sm text-slate-900 font-bold block">
                {loan.customer.firstName} {loan.customer.lastName}
              </strong>
              <span className="text-slate-500">{loan.customer.documentNumber}</span>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Teléfono / WhatsApp:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-semibold text-slate-800">{loan.customer.phone}</span>
                <a
                  href={generateWhatsAppUrl(
                    loan.customer.phone,
                    `Hola ${loan.customer.firstName}, le saludamos de Nancy Calzado respecto a su préstamo ${loan.loanCode}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center gap-1 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </a>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block">Dirección:</span>
              <p className="text-slate-700 font-medium">{loan.customer.address}</p>
            </div>

            {loan.collateral && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Prenda o Garantía en Custodia</span>
                </span>
                <p className="text-slate-800 font-medium">{loan.collateral}</p>
              </div>
            )}

            {loan.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Notas</span>
                <p className="text-slate-700 mt-0.5">{loan.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Amortization Table */}
        <div className="lg:col-span-2">
          <AmortizationTable
            installments={loan.installments}
            contractInfo={{
              code: loan.loanCode,
              type: "LOAN",
              customer: loan.customer,
            }}
          />
        </div>
      </div>
    </div>
  );
}
