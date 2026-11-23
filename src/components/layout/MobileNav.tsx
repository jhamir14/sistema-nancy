"use client";

import { useState } from "react";
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
  Menu,
  X,
  ChevronRight,
  Calculator,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { LoanCalculatorModal } from "@/components/calculator/LoanCalculatorModal";
import { logoutAction } from "@/actions/auth-actions";

export interface MobileNavUser {
  name: string;
  username: string;
  role: string;
}

const allNavigationItems = [
  {
    name: "Dashboard (Home)",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
    category: "Principal",
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
    badge: null,
    category: "Principal",
  },
  {
    name: "Zapatillas (Inventario)",
    href: "/zapatillas",
    icon: Footprints,
    badge: null,
    category: "Principal",
  },
  {
    name: "Créditos de Zapatillas",
    href: "/creditos",
    icon: CreditCard,
    badge: "Cuotas",
    category: "Financiamiento",
  },
  {
    name: "Préstamos en Efectivo",
    href: "/prestamos",
    icon: Banknote,
    badge: "Cuotas",
    category: "Financiamiento",
  },
  {
    name: "Cobranzas de Hoy",
    href: "/caja",
    icon: CalendarCheck,
    badge: "Hoy",
    category: "Cobros & Control",
  },
  {
    name: "Historial de Cobros",
    href: "/cobranzas",
    icon: Receipt,
    badge: null,
    category: "Cobros & Control",
  },
  {
    name: "Reportes en PDF",
    href: "/reportes",
    icon: FileText,
    badge: "PDF",
    category: "Cobros & Control",
  },
];

const bottomBarItems = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Zapatillas", href: "/zapatillas", icon: Footprints },
  { name: "Cobros Hoy", href: "/caja", icon: CalendarCheck },
];

export function MobileNav({ user }: { user?: MobileNavUser | null }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* 1. Mobile Top Header Bar (md:hidden) */}
      <header className="md:hidden h-14 bg-slate-900 text-white px-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-base shadow-xs">
            N
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-none">
              Sistema Nancy
            </h1>
            <span className="text-[10px] text-amber-400 font-medium">Préstamos & Calzado</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <LoanCalculatorModal />
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      </header>

      {/* 2. Slide-Over Drawer Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 3. Slide-Over Drawer Content */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-[290px] max-w-[85vw] bg-slate-900 text-slate-100 z-50 md:hidden flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-sm">
              N
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Menú Completo</h2>
              <p className="text-[11px] text-slate-400">Acceso a todos los módulos</p>
            </div>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {allNavigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsDrawerOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition active:scale-98 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isActive ? "text-slate-950" : ""}`} />
              </Link>
            );
          })}
        </nav>

        {/* Drawer Footer with User & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
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

          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400">Sesión Segura y Protegida</span>
          </div>
        </div>
      </div>

      {/* 4. Mobile Bottom Sticky Navigation Bar (md:hidden) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-bottom">
        {bottomBarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95 min-w-[56px] ${
                isActive ? "text-amber-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                  isActive ? "bg-amber-100 text-amber-700" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 leading-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* 5th item: More / Drawer trigger */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition active:scale-95 min-w-[56px] ${
            isDrawerOpen ? "text-amber-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 text-slate-700">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Más</span>
        </button>
      </nav>
    </>
  );
}
