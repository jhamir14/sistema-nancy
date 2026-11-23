"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Receipt, Bell, LogOut, ShieldCheck, User } from "lucide-react";
import { LoanCalculatorModal } from "@/components/calculator/LoanCalculatorModal";
import { logoutAction } from "@/actions/auth-actions";

export interface HeaderUser {
  name: string;
  username: string;
  role: string;
}

export function Header({ user }: { user?: HeaderUser | null }) {
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    const formatted = new Intl.DateTimeFormat("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
    setDateStr(formatted);
  }, []);

  return (
    <header className="hidden md:flex h-16 border-b border-slate-200 bg-white px-6 items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Panel de Administración
          </span>
          <p className="text-sm font-medium text-slate-700 capitalize">
            {dateStr || "Cargando fecha..."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LoanCalculatorModal />

        <Link
          href="/caja"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
        >
          <Bell className="w-4 h-4 animate-bounce" />
          <span>Cobranzas de Hoy</span>
        </Link>

        <Link
          href="/cobranzas"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
        >
          <Receipt className="w-4 h-4" />
          <span>Cobrar Cuota</span>
        </Link>

        <Link
          href="/creditos"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Nuevo Crédito</span>
        </Link>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div className="hidden lg:block text-left">
              <span className="font-bold text-slate-900 block leading-tight">
                {user?.name || "Administrador"}
              </span>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                {user?.role || "ADMIN"}
              </span>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Cerrar Sesión"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
