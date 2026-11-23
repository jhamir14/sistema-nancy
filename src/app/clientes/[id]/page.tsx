import { getCustomerById } from "@/actions/customer-actions";
import { EditCustomerModal } from "@/components/customers/EditCustomerModal";
import { CustomerWhatsAppButton } from "@/components/customers/CustomerWhatsAppButton";
import { formatCurrency, formatDate, generateWhatsAppUrl } from "@/lib/utils";
import { CREDIT_SCORE_LABELS, CreditScore } from "@/lib/types";
import {
  User,
  Phone,
  MapPin,
  MessageCircle,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Banknote,
  Receipt,
  ArrowLeft,
  Footprints,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  // Cálculos consolidados del cliente
  let totalLoanVolume = 0;
  let totalShoeCreditVolume = 0;
  let totalPaidAmount = 0;
  let totalActiveDebt = 0;
  let overdueInstallmentsCount = 0;

  customer.loans.forEach((l) => {
    totalLoanVolume += l.totalAmount;
    l.installments.forEach((inst) => {
      totalPaidAmount += inst.paidAmount;
      if (inst.status !== "PAID") {
        totalActiveDebt += inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
        if (new Date(inst.dueDate) < new Date()) {
          overdueInstallmentsCount++;
        }
      }
    });
  });

  customer.shoeCredits.forEach((sc) => {
    totalShoeCreditVolume += sc.totalSaleAmount;
    sc.installments.forEach((inst) => {
      totalPaidAmount += inst.paidAmount;
      if (inst.status !== "PAID") {
        totalActiveDebt += inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
        if (new Date(inst.dueDate) < new Date()) {
          overdueInstallmentsCount++;
        }
      }
    });
  });

  const totalVolume = totalLoanVolume + totalShoeCreditVolume;
  const scoreConfig =
    CREDIT_SCORE_LABELS[customer.creditScore as CreditScore] || CREDIT_SCORE_LABELS.GOOD;

  const waGreeting = `Hola ${customer.firstName}, le saludamos cordialmente de Nancy Calzado.`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clientes"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {customer.firstName} {customer.lastName}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreConfig.badge}`}
              >
                {scoreConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {customer.documentType}: {customer.documentNumber} • Cliente desde:{" "}
              {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <EditCustomerModal customer={customer} />
          <Link
            href={`/prestamos?customerId=${customer.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Prestar Dinero</span>
          </Link>
          <Link
            href={`/creditos?customerId=${customer.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <Footprints className="w-3.5 h-3.5 text-amber-400" />
            <span>Dar Calzado a Crédito</span>
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Deuda Activa Pendiente</span>
          <p
            className={`text-2xl font-black mt-1 ${
              totalActiveDebt > 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(totalActiveDebt)}
          </p>
          {overdueInstallmentsCount > 0 && (
            <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" />
              <span>{overdueInstallmentsCount} cuotas vencidas</span>
            </span>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Histórico Financiado</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalVolume)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Préstamos + Zapatillas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Amortizado / Pagado</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalPaidAmount)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Cobrado en caja</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Contratos Activos</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {customer.loans.filter((l) => l.status === "ACTIVE").length +
              customer.shoeCredits.filter((sc) => sc.status === "ACTIVE").length}{" "}
            activos
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {customer.loans.length} préstamos • {customer.shoeCredits.length} zapatillas
          </span>
        </div>
      </div>

      {/* Profile Details & Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact & Guarantor Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            <span>Ficha y Contacto</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Teléfono Principal:</span>
              <div className="flex items-center justify-between mt-0.5">
                <span className="font-bold text-slate-900 text-sm">{customer.phone}</span>
                <CustomerWhatsAppButton
                  customerName={`${customer.firstName} ${customer.lastName}`}
                  phone={customer.phone}
                  totalActiveDebt={totalActiveDebt}
                  overdueCount={overdueInstallmentsCount}
                  activeContractCode={customer.loans[0]?.loanCode || customer.shoeCredits[0]?.creditCode}
                />
              </div>
            </div>

            {customer.phoneSecondary && (
              <div>
                <span className="text-slate-400 block text-[11px]">Teléfono Secundario:</span>
                <span className="font-semibold text-slate-700">{customer.phoneSecondary}</span>
              </div>
            )}

            <div>
              <span className="text-slate-400 block text-[11px]">Dirección:</span>
              <div className="flex items-start gap-1.5 text-slate-800 font-medium mt-0.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{customer.address}</span>
              </div>
              {customer.referenceAddress && (
                <p className="text-[11px] text-slate-500 mt-1 pl-5">
                  Ref: {customer.referenceAddress}
                </p>
              )}
            </div>

            {customer.workplace && (
              <div>
                <span className="text-slate-400 block text-[11px]">Lugar de Trabajo / Ocupación:</span>
                <div className="flex items-center gap-1.5 text-slate-800 font-medium mt-0.5">
                  <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{customer.workplace}</span>
                </div>
              </div>
            )}

            {customer.guarantorName && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Garante / Aval</span>
                </span>
                <p className="font-semibold text-slate-800">{customer.guarantorName}</p>
                {customer.guarantorPhone && (
                  <p className="text-slate-500 text-[11px]">Tel: {customer.guarantorPhone}</p>
                )}
              </div>
            )}

            {customer.notes && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Notas Internas
                </span>
                <p className="text-slate-700 mt-0.5">{customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* History of Shoe Credits & Loans */}
        <div className="md:col-span-2 space-y-6">
          {/* Créditos de Zapatillas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-amber-500" />
                <span>Créditos de Zapatillas ({customer.shoeCredits.length})</span>
              </span>
              <span className="text-xs font-normal text-slate-400">Semanales y Mensuales</span>
            </h3>

            {customer.shoeCredits.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                El cliente aún no ha adquirido zapatillas a crédito.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 mt-3 space-y-3">
                {customer.shoeCredits.map((sc) => {
                  const isPaid = sc.status === "PAID";
                  const paidCount = sc.installments.filter((i) => i.status === "PAID").length;
                  const totalPaid = sc.installments.reduce((acc, i) => acc + i.paidAmount, 0);
                  const remaining = Math.max(0, sc.financedAmount - totalPaid);

                  return (
                    <div key={sc.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 text-[11px]">
                            {sc.creditCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isPaid ? "Completamente Pagado" : "Activo en Cobro"}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {sc.frequency === "WEEKLY" ? "Semanal" : "Mensual"}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(sc.totalSaleAmount)}
                        </span>
                      </div>

                      {/* Items de Calzado */}
                      <div className="flex flex-wrap gap-1.5">
                        {sc.items.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
                          >
                            <strong>
                              {item.shoeVariant.shoe.brand} {item.shoeVariant.shoe.model}
                            </strong>{" "}
                            (Talla {item.shoeVariant.size})
                          </span>
                        ))}
                      </div>

                      {/* Progreso */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>
                          {paidCount} de {sc.installmentsCount} cuotas pagadas
                        </span>
                        <span>
                          Saldo por pagar:{" "}
                          <strong className={remaining > 0 ? "text-rose-600" : "text-emerald-600"}>
                            {formatCurrency(remaining)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Préstamos en Efectivo */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Préstamos en Efectivo ({customer.loans.length})</span>
              </span>
              <span className="text-xs font-normal text-slate-400">Semanales y Mensuales</span>
            </h3>

            {customer.loans.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                El cliente no registra préstamos en efectivo.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 mt-3 space-y-3">
                {customer.loans.map((l) => {
                  const isPaid = l.status === "PAID";
                  const paidCount = l.installments.filter((i) => i.status === "PAID").length;
                  const totalPaid = l.installments.reduce((acc, i) => acc + i.paidAmount, 0);
                  const remaining = Math.max(0, l.totalAmount - totalPaid);

                  return (
                    <div key={l.id} className="pt-3 first:pt-0 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[11px]">
                            {l.loanCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {isPaid ? "Liquidado" : "Activo"}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {l.frequency === "WEEKLY" ? "Semanal" : "Mensual"} • {l.interestRate}% interés
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(l.totalAmount)}
                        </span>
                      </div>

                      {l.collateral && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                          Garantía: {l.collateral}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>
                          {paidCount} de {l.installmentsCount} cuotas pagadas
                        </span>
                        <span>
                          Saldo pendiente:{" "}
                          <strong className={remaining > 0 ? "text-rose-600" : "text-emerald-600"}>
                            {formatCurrency(remaining)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Historial de Pagos y Recibos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>Historial de Pagos y Recibos ({customer.payments.length})</span>
            </h3>

            {customer.payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aún no hay recibos emitidos para este cliente.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 mt-3">
                {customer.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800">{p.receiptNumber}</span>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(p.paymentDate)} • Medio: {p.paymentMethod}
                        {p.referenceCode && ` • Ref: ${p.referenceCode}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-emerald-600 text-sm">
                        +{formatCurrency(p.amount)}
                      </span>
                      <p className="text-[10px] text-slate-400">Cobrado por {p.collectedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
