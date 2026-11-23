"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Footprints,
  CreditCard,
  Banknote,
  Receipt,
  CalendarCheck,
  FileText,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";

export interface SidebarUser {
  name: string;
  username: string;
  role: string;
}

const navigationItems = [
  {
    name: "Dashboard (Home)",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
    badge: null,
  },
  {
    name: "Zapatillas (Inventario)",
    href: "/zapatillas",
    icon: Footprints,
    badge: null,
  },
  {
    name: "Créditos de Zapatillas",
    href: "/creditos",
    icon: CreditCard,
    badge: "Cuotas",
  },
  {
    name: "Préstamos en Efectivo",
    href: "/prestamos",
    icon: Banknote,
    badge: "Cuotas",
  },
  {
    name: "Cobranzas de Hoy",
    href: "/caja",
    icon: CalendarCheck,
    badge: "Cobros del Día",
  },
  {
    name: "Historial de Cobros",
    href: "/cobranzas",
    icon: Receipt,
    badge: null,
  },
  {
    name: "Reportes en PDF",
    href: "/reportes",
    icon: FileText,
    badge: "PDF",
  },
];

export function Sidebar({ user }: { user?: SidebarUser | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-black text-xl">
          N
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight tracking-tight text-white">
            Sistema Nancy
          </h1>
          <p className="text-xs text-slate-400">Préstamos & Zapatillas</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Módulos Principales
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
              <span className="flex-1 truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {user?.name || "Nancy (Admin)"}
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                {user?.role || "ADMIN"}
              </span>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Cerrar Sesión"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-400">Sesión Segura y Protegida</span>
        </div>
      </div>
    </aside>
  );
}
