import { getCustomers } from "@/actions/customer-actions";
import { NewCustomerModal } from "@/components/customers/NewCustomerModal";
import { formatCurrency, generateWhatsAppUrl } from "@/lib/utils";
import { CREDIT_SCORE_LABELS, CreditScore } from "@/lib/types";
import {
  Users,
  Phone,
  MapPin,
  MessageCircle,
  AlertCircle,
  PlusCircle,
  Search,
  ChevronRight,
  Banknote,
  Footprints,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  const totalActiveDebt = customers.reduce((acc, c) => acc + c.activeDebt, 0);
  const customersWithDebt = customers.filter((c) => c.activeDebt > 0).length;

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            <span>Gestión de Clientes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ficha de clientes, historial crediticio, deudas activas y contacto directo.
          </p>
        </div>

        <NewCustomerModal />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between sm:block">
          <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase">Total Clientes</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{customers.length}</p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between sm:block">
          <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase">Con Deuda Activa</span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">{customersWithDebt} clientes</p>
        </div>
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between sm:block">
          <span className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase">Deuda Total de Clientes</span>
          <p className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{formatCurrency(totalActiveDebt)}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <form className="flex-1" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Buscar por nombre, apellido, DNI o teléfono..."
            className="w-full text-xs sm:text-sm outline-hidden text-slate-800 placeholder-slate-400"
          />
        </form>
      </div>

      {/* Empty State */}
      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No se encontraron clientes</h4>
          <p className="text-xs text-slate-400 mt-1">
            Intenta con otro término de búsqueda o registra a un cliente nuevo.
          </p>
        </div>
      ) : (
        <>
          {/* VISTA MÓVIL: Tarjetas táctiles optimizadas para teléfonos */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {customers.map((c) => {
              const scoreConfig =
                CREDIT_SCORE_LABELS[c.creditScore as CreditScore] || CREDIT_SCORE_LABELS.GOOD;
              const waGreeting = `Hola ${c.firstName}, le saludamos de Sistema Nancy.`;

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  {/* Top row: Name, Score & Dossier link */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/clientes/${c.id}`}
                        className="font-black text-slate-900 text-base leading-snug hover:text-amber-600 flex items-center gap-1"
                      >
                        <span>{c.firstName} {c.lastName}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </Link>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {c.documentType}: {c.documentNumber}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${scoreConfig.badge}`}
                    >
                      {scoreConfig.label}
                    </span>
                  </div>

                  {/* Financial Debt & Contracts */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                        Saldo Pendiente:
                      </span>
                      <span
                        className={`font-black text-base font-mono ${
                          c.activeDebt > 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {c.activeDebt > 0 ? formatCurrency(c.activeDebt) : "Al día (S/ 0.00)"}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">
                        {c.activeLoansCount} préstamos • {c.activeCreditsCount} calzado
                      </span>
                      {c.overdueInstallmentsCount > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 inline-flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />
                          {c.overdueInstallmentsCount} cuotas vencidas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {c.address && (
                    <div className="flex items-start gap-1 text-[11px] text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{c.address}</span>
                    </div>
                  )}

                  {/* Actions Bar for Mobile: WhatsApp, Call, +Préstamo, +Calzado */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    {c.phone && (
                      <>
                        <a
                          href={`tel:${c.phone}`}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-600" />
                          <span>Llamar</span>
                        </a>

                        <a
                          href={generateWhatsAppUrl(c.phone, waGreeting)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </>
                    )}

                    <Link
                      href={`/prestamos?customerId=${c.id}`}
                      className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-600 transition"
                      title="Dar préstamo"
                    >
                      <Banknote className="w-4 h-4" />
                    </Link>

                    <Link
                      href={`/creditos?customerId=${c.id}`}
                      className="p-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                      title="Dar calzado a crédito"
                    >
                      <Footprints className="w-4 h-4 text-amber-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VISTA DESKTOP: Tabla completa para computadoras */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Cliente / Documento</th>
                    <th className="py-3.5 px-4">Contacto</th>
                    <th className="py-3.5 px-4">Dirección & Garante</th>
                    <th className="py-3.5 px-4">Calificación</th>
                    <th className="py-3.5 px-4">Deuda Activa</th>
                    <th className="py-3.5 px-4 text-right">Acciones Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const scoreConfig =
                      CREDIT_SCORE_LABELS[c.creditScore as CreditScore] || CREDIT_SCORE_LABELS.GOOD;
                    const waGreeting = `Hola ${c.firstName}, le saludamos de Nancy Calzado.`;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/clientes/${c.id}`}
                            className="font-bold text-slate-900 text-sm hover:text-amber-600 transition flex items-center gap-1 group"
                          >
                            <span>{c.firstName} {c.lastName}</span>
                            <span className="text-[10px] opacity-0 group-hover:opacity-100 transition text-amber-500">&rarr;</span>
                          </Link>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-700">{c.documentType}:</span>
                            <span>{c.documentNumber}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{c.phone}</span>
                            <a
                              href={generateWhatsAppUrl(c.phone, waGreeting)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              title="Chat WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          {c.phoneSecondary && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Familiar: {c.phoneSecondary}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-start gap-1 text-slate-700 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate">{c.address}</span>
                          </div>
                          {c.guarantorName && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Garante: <strong className="text-slate-700">{c.guarantorName}</strong>
                              {c.guarantorPhone && ` (${c.guarantorPhone})`}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreConfig.badge}`}
                          >
                            {scoreConfig.label}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {c.activeLoansCount} préstamos • {c.activeCreditsCount} zapatillas
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div
                            className={`font-black text-sm ${
                              c.activeDebt > 0 ? "text-slate-900" : "text-emerald-600"
                            }`}
                          >
                            {c.activeDebt > 0 ? formatCurrency(c.activeDebt) : "Al día"}
                          </div>
                          {c.overdueInstallmentsCount > 0 && (
                            <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3" />
                              <span>{c.overdueInstallmentsCount} cuotas vencidas</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/prestamos?customerId=${c.id}`}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition"
                              title="Dar préstamo en efectivo"
                            >
                              + Préstamo
                            </Link>
                            <Link
                              href={`/creditos?customerId=${c.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition"
                              title="Dar zapatillas a crédito"
                            >
                              + Calzado
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
