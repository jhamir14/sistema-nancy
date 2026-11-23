import { PdfReportCenter } from "@/components/reports/PdfReportCenter";
import { prisma } from "@/lib/prisma";
import {
  FileText,
  Users,
  Footprints,
  Receipt,
  Printer,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  // Stats overview for reports header
  const [totalCustomers, totalShoesCount, totalPaymentsCount] = await Promise.all([
    prisma.customer.count(),
    prisma.shoeVariant.aggregate({ _sum: { stock: true } }),
    prisma.payment.count(),
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Informes y Contabilidad</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Centro de Reportes en PDF
        </h1>
        <p className="text-sm text-slate-500">
          Visualiza y descarga en PDF listos para imprimir la cartera de clientes, inventario valorizado y cobranzas
        </p>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Clientes Registrados
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalCustomers}
            </div>
            <span className="text-[11px] text-slate-400">Base de datos de clientes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pares en Almacén
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1 font-mono">
              {totalShoesCount._sum.stock || 0}
            </div>
            <span className="text-[11px] text-slate-400">Inventario físico disponible</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Footprints className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recibos Generados
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              {totalPaymentsCount}
            </div>
            <span className="text-[11px] text-slate-400">Comprobantes de pago registrados</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Export Center Section */}
      <PdfReportCenter />
    </div>
  );
}
