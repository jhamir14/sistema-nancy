import Link from "next/link";
import { getDashboardMetrics } from "@/actions/dashboard-actions";
import { MonthlyCollectionChart } from "@/components/dashboard/MonthlyCollectionChart";
import { PortfolioDonutChart } from "@/components/dashboard/PortfolioDonutChart";
import { BrandStockChart } from "@/components/dashboard/BrandStockChart";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";
import {
  Banknote,
  Footprints,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  MessageCircle,
  PlusCircle,
  TrendingUp,
  Receipt,
  Users,
  Bell,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Title & Quick Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de Control Financiero
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Resumen global de capital invertido, cartera en la calle y cobranzas programadas.
          </p>
        </div>

        {/* Quick Launch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/prestamos"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition"
          >
            <Banknote className="w-4 h-4" />
            <span>Prestar Dinero</span>
          </Link>
          <Link
            href="/creditos"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm transition"
          >
            <Footprints className="w-4 h-4 text-amber-400" />
            <span>Crédito de Zapatillas</span>
          </Link>
        </div>
      </div>

      {/* NOTIFICACIÓN DE COBROS DE HOY PARA NANCY */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 p-4 sm:p-5 text-slate-950 shadow-md border border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/15 px-2 py-0.5 rounded-md">
              Aviso de Cobranzas
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-950 leading-snug mt-0.5">
              {metrics.countDueToday > 0 ? (
                <>Tienes {metrics.countDueToday} cliente{metrics.countDueToday > 1 ? "s" : ""} programado{metrics.countDueToday > 1 ? "s" : ""} para pagar hoy ({formatCurrency(metrics.totalDueToday)})</>
              ) : (
                <>Cobranzas del Día: Todos al día hoy</>
              )}
            </h3>
            <p className="text-xs text-slate-900/80 font-medium">
              {metrics.overdueInstallmentsCount > 0 ? (
                <>Tienes {metrics.overdueInstallmentsCount} cuotas vencidas acumuladas por cobrar ({formatCurrency(metrics.totalOverdueAmount)}).</>
              ) : (
                <>No tienes morosidad pendiente registrada.</>
              )}
            </p>
          </div>
        </div>

        <Link
          href="/caja"
          className="shrink-0 px-4 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-900 transition shadow-sm flex items-center gap-2"
        >
          <span>Ver Cobranzas de Hoy</span>
          <ArrowUpRight className="w-4 h-4 text-amber-400" />
        </Link>
      </div>

      {/* TOP KPI CARDS: Inversión, Cartera, Recaudación, Riesgo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: Dinero Total Invertido */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dinero Total Invertido
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {formatCurrency(metrics.totalMoneyInvested)}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Stock Zapatillas ({metrics.totalPhysicalPairsInStock} pares):</span>
              <span className="font-semibold">{formatCurrency(metrics.totalInvestedInShoeStock)}</span>
            </div>
            <div className="flex justify-between">
              <span>Capital en Préstamos:</span>
              <span className="font-semibold">{formatCurrency(metrics.totalCapitalInActiveLoans)}</span>
            </div>
            <div className="flex justify-between">
              <span>Costo Calzado a Crédito:</span>
              <span className="font-semibold">{formatCurrency(metrics.totalCostOfShoesInActiveCredits)}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Cartera Total por Cobrar (Dinero en la calle) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cartera por Cobrar
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">
            {formatCurrency(metrics.totalReceivable)}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Por Préstamos Activos:</span>
              <span className="font-semibold">{formatCurrency(metrics.totalReceivableFromLoans)}</span>
            </div>
            <div className="flex justify-between">
              <span>Por Créditos Zapatillas:</span>
              <span className="font-semibold">{formatCurrency(metrics.totalReceivableFromShoeCredits)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Modalidad:</span>
              <span className="font-medium text-slate-600">Semanal y Mensual</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Recaudación de Cobranza */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cobranzas Recaudadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {formatCurrency(metrics.totalCollectedThisMonth)}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Cobrado Hoy:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(metrics.totalCollectedToday)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Histórico Cobrado:</span>
              <span className="font-semibold">{formatCurrency(metrics.totalCollectedAllTime)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Clientes Activos:</span>
              <span className="font-medium text-slate-600">{metrics.customersCount} registrados</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Morosidad y Cuotas Vencidas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Morosidad / En Riesgo
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {formatCurrency(metrics.totalOverdueAmount)}
          </p>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Cuotas Vencidas:</span>
              <span className="font-bold text-rose-700">{metrics.overdueInstallmentsCount} cuotas</span>
            </div>
            <div className="flex justify-between">
              <span>Zapatillas con Stock Bajo:</span>
              <span className="font-semibold text-amber-700">{metrics.lowStockCount} modelos</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Créditos Activos:</span>
              <span className="font-medium text-slate-600">
                {metrics.activeLoansCount + metrics.activeCreditsCount} contratos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyCollectionChart data={metrics.monthlyCollection} />
        </div>
        <div>
          <PortfolioDonutChart
            loansAmount={metrics.totalReceivableFromLoans}
            creditsAmount={metrics.totalReceivableFromShoeCredits}
          />
        </div>
      </div>

      {/* TWO COLUMN GRID: Cuotas a Cobrar & Flujo de Caja */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Cuotas por Cobrar Hoy y en la Semana */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>Agenda de Cobranzas Próximas (Hoy y 7 Días)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cuotas semanales o mensuales que vencen en los próximos días.
              </p>
            </div>
            <Link
              href="/cobranzas"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Ver todas &rarr;
            </Link>
          </div>

          {metrics.dueTodayOrSoon.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-sm font-medium text-slate-600">No hay cuotas programadas para esta semana</p>
              <p className="text-xs text-slate-400 mt-1">
                Los cobros programados de tus préstamos o créditos aparecerán automáticamente aquí.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {metrics.dueTodayOrSoon.map((inst) => {
                const customer = inst.loan?.customer || inst.shoeCredit?.customer;
                if (!customer) return null;

                const pendingAmount = inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
                const isLoan = !!inst.loanId;
                const typeLabel = isLoan ? "Préstamo" : "Zapatillas";
                const code = inst.loan?.loanCode || inst.shoeCredit?.creditCode;
                const frequency = inst.loan?.frequency || inst.shoeCredit?.frequency;

                const waMessage = `Hola ${customer.firstName}, le recordamos desde Nancy Calzado que su cuota #${inst.installmentNumber} de ${typeLabel} (${code}) vence el ${formatDate(inst.dueDate)} por un monto de ${formatCurrency(pendingAmount)}. ¡Muchas gracias!`;

                return (
                  <div key={inst.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {customer.firstName} {customer.lastName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Cuota #{inst.installmentNumber} • Vence:{" "}
                        <strong className="text-slate-700">{formatDate(inst.dueDate)}</strong> • Frecuencia:{" "}
                        {frequency === "WEEKLY" ? "Semanal" : "Mensual"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-bold text-slate-900">
                          {formatCurrency(pendingAmount)}
                        </span>
                        <p className="text-[10px] text-slate-400">Saldo pendiente</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botón WhatsApp */}
                        <a
                          href={generateWhatsAppUrl(customer.phone, waMessage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition"
                          title="Enviar recordatorio por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {/* Botón Cobrar */}
                        <Link
                          href={`/cobranzas?installmentId=${inst.id}`}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
                        >
                          Cobrar
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Flujo de Caja y Movimientos Recientes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Movimientos de Caja</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Ingresos y egresos recientes</p>
            </div>
          </div>

          {metrics.recentCashTransactions.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-xs text-slate-400">Aún no hay movimientos de caja registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {metrics.recentCashTransactions.map((tx) => {
                const isIncome = tx.type === "INCOME";
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                          isIncome ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{tx.description}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(tx.createdAt)}</p>
                      </div>
                    </div>

                    <span
                      className={`font-bold shrink-0 text-sm ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
