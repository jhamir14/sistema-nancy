import { getCollateralItems } from "@/actions/collateral-actions";
import { CollateralView } from "@/components/loans/CollateralView";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Banknote,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GarantiasPage() {
  const items = await getCollateralItems();

  const totalInCustody = items.filter((i) => i.custodyStatus === "IN_CUSTODY").length;
  const totalReady = items.filter((i) => i.custodyStatus === "READY_TO_RETURN").length;
  const totalAtRisk = items.filter((i) => i.custodyStatus === "AT_RISK").length;
  const totalPrincipalBacked = items.reduce((acc, i) => acc + i.principalAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
          <Lock className="w-4 h-4" />
          <span>Custodia y Prendas en Garantía</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Almacén de Prendas y Garantías de Préstamos
        </h1>
        <p className="text-sm text-slate-500">
          Control de objetos, calzado exclusivo y prendas dejadas en custodia mientras el cliente
          cancela su deuda
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              En Bóveda / Custodia
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {totalInCustody} <span className="text-sm font-normal text-slate-500">prendas</span>
            </div>
            <span className="text-[11px] text-slate-400">Préstamos activos al día</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Listas para Devolución
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {totalReady} <span className="text-sm font-normal text-slate-500">prendas</span>
            </div>
            <span className="text-[11px] text-slate-400">Deuda cancelada al 100%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              En Riesgo / Atrasadas
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {totalAtRisk} <span className="text-sm font-normal text-slate-500">prendas</span>
            </div>
            <span className="text-[11px] text-slate-400">Cuotas vencidas en mora</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Capital Respaldado
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {formatCurrency(totalPrincipalBacked)}
            </div>
            <span className="text-[11px] text-slate-400">Préstamos con garantía</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Collateral Grid */}
      <CollateralView initialItems={items} />
    </div>
  );
}
