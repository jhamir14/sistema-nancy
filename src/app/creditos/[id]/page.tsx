import { getShoeCreditById } from "@/actions/credit-actions";
import { AmortizationTable } from "@/components/installments/AmortizationTable";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";
import {
  Footprints,
  User,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ShoeCreditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const credit = await getShoeCreditById(id);

  if (!credit) {
    notFound();
  }

  const isCompleted = credit.status === "PAID";
  const totalPaid = credit.installments.reduce((acc, i) => acc + i.paidAmount, 0);
  const remainingBalance = Math.max(0, credit.financedAmount - totalPaid);
  const paidCount = credit.installments.filter((i) => i.status === "PAID").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/creditos"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold text-sm">
                {credit.creditCode}
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Crédito de Zapatillas
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {isCompleted ? "Completamente Pagado" : "Activo en Cobro"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Entregado el {formatDate(credit.startDate)} • Modalidad:{" "}
              {credit.frequency === "WEEKLY" ? "Cuotas Semanales" : "Cuotas Mensuales"}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Venta Calzado</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(credit.totalSaleAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Precio acordado a cuotas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Inicial / Enganche</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(credit.downPayment)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Cobrado al momento</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Saldo Financiado</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{formatCurrency(credit.financedAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Dividido en cuotas</span>
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
            {paidCount} de {credit.installmentsCount} cuotas pagadas
          </span>
        </div>
      </div>

      {/* Grid: Details & Amortization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Shoes delivered & Customer Info */}
        <div className="space-y-5">
          {/* Zapatillas Entregadas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-amber-500" />
              <span>Calzado Entregado ({credit.items.length} pares)</span>
            </h3>

            <div className="space-y-2">
              {credit.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-600">
                      {item.shoeVariant.shoe.brand}
                    </span>
                    <strong className="block font-bold text-slate-900">
                      {item.shoeVariant.shoe.model}
                    </strong>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Talla: <strong className="text-slate-800">{item.shoeVariant.size}</strong> • Color:{" "}
                      {item.shoeVariant.colorway}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block">
                      {formatCurrency(item.unitCreditPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.quantity} par</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>Cliente Comprador</span>
              </span>
              <Link
                href={`/clientes/${credit.customer.id}`}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold"
              >
                Ver perfil &rarr;
              </Link>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Nombre Completo:</span>
                <strong className="text-sm text-slate-900 font-bold block">
                  {credit.customer.firstName} {credit.customer.lastName}
                </strong>
                <span className="text-slate-500">{credit.customer.documentNumber}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Teléfono / WhatsApp:</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-semibold text-slate-800">{credit.customer.phone}</span>
                  <a
                    href={generateWhatsAppUrl(
                      credit.customer.phone,
                      `Hola ${credit.customer.firstName}, le saludamos de Nancy Calzado respecto a su crédito ${credit.creditCode}.`
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
                <p className="text-slate-700 font-medium">{credit.customer.address}</p>
              </div>

              {credit.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Notas</span>
                  <p className="text-slate-700 mt-0.5">{credit.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amortization Table */}
        <div className="lg:col-span-2">
          <AmortizationTable
            installments={credit.installments}
            contractInfo={{
              code: credit.creditCode,
              type: "CREDIT",
              customer: credit.customer,
            }}
          />
        </div>
      </div>
    </div>
  );
}
