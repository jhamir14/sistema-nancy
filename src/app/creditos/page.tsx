import { getShoeCredits } from "@/actions/credit-actions";

export const dynamic = "force-dynamic";
import { getCustomers } from "@/actions/customer-actions";
import { getShoeVariantsAvailable } from "@/actions/shoe-actions";
import { NewShoeCreditModal } from "@/components/credits/NewShoeCreditModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, Footprints, Calendar, User, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function CreditosPage() {
  const [credits, customers, variants] = await Promise.all([
    getShoeCredits(),
    getCustomers(),
    getShoeVariantsAvailable(),
  ]);

  const activeCredits = credits.filter((c) => c.status === "ACTIVE");
  const totalFinanced = activeCredits.reduce((acc, c) => acc + c.financedAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-amber-500" />
            <span>Créditos de Zapatillas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ventas de calzado con pago a plazos en cuotas Semanales o Mensuales.
          </p>
        </div>

        <NewShoeCreditModal
          customers={customers.map((c) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            documentNumber: c.documentNumber,
            phone: c.phone,
          }))}
          variants={variants}
        />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Créditos Activos</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{activeCredits.length}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Total histórico: {credits.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Capital Financiado Activo</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(totalFinanced)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Monto en la calle por cobrar</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Modalidad Autorizada</span>
          <p className="text-base font-bold text-slate-800 mt-1">Cuotas Semanales y Mensuales</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Cronograma de pagos automático</span>
        </div>
      </div>

      {/* List of Credits */}
      {credits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Footprints className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No hay créditos de zapatillas registrados</h4>
          <p className="text-xs text-slate-400 mt-1">
            Haz clic en &quot;Nuevo Crédito de Zapatilla&quot; para otorgar el primero.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {credits.map((c) => {
            const isCompleted = c.status === "PAID";
            const totalPaid = c.installments.reduce((acc, i) => acc + i.paidAmount, 0);
            const remainingBalance = Math.max(0, c.financedAmount - totalPaid);
            const paidInstallments = c.installments.filter((i) => i.status === "PAID").length;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Info: Code, Customer & Shoes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/creditos/${c.id}`}
                      className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-amber-400 font-mono font-bold text-xs transition"
                      title="Ver detalle y cronograma"
                    >
                      {c.creditCode} &rarr;
                    </Link>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isCompleted ? "Completamente Pagado" : "Activo en Cobro"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Inició: {formatDate(c.startDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>
                      {c.customer.firstName} {c.customer.lastName} ({c.customer.documentNumber})
                    </span>
                    <span className="text-xs font-normal text-slate-500">• Tel: {c.customer.phone}</span>
                  </div>

                  {/* Zapatillas entregadas */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {c.items.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        <Footprints className="w-3.5 h-3.5 text-amber-500" />
                        <strong>
                          {item.shoeVariant.shoe.brand} {item.shoeVariant.shoe.model}
                        </strong>{" "}
                        (Talla: {item.shoeVariant.size}) • {item.quantity} par
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Info: Financial Summary & Actions */}
                <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Total Financiado</span>
                    <span className="font-bold text-sm text-slate-900">
                      {formatCurrency(c.financedAmount)}
                    </span>
                    {c.downPayment > 0 && (
                      <span className="text-[10px] text-emerald-600 block">
                        Inicial pagada: {formatCurrency(c.downPayment)}
                      </span>
                    )}
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-[11px] text-slate-400 block">Progreso de Cuotas</span>
                    <span className="font-bold text-sm text-slate-800">
                      {paidInstallments} de {c.installmentsCount} cuotas (
                      {c.frequency === "WEEKLY" ? "Semanales" : "Mensuales"})
                    </span>
                    <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{
                          width: `${(paidInstallments / c.installmentsCount) * 100}%`,
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
                      href={`/creditos/${c.id}`}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
                    >
                      Ver Cronograma
                    </Link>
                    {!isCompleted && (
                      <Link
                        href={`/cobranzas?search=${c.creditCode}`}
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
