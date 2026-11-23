"use client";

import { useState } from "react";
import { getExportData } from "@/actions/cash-actions";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Printer,
  Users,
  Footprints,
  Receipt,
  Loader2,
  Calendar,
  X,
  Download,
  CheckCircle2,
} from "lucide-react";

type ExportType = "customers_debt" | "inventory" | "payments";

interface ActiveReport {
  type: ExportType;
  title: string;
  subtitle: string;
  data: any[];
}

export function PdfReportCenter() {
  const [loadingType, setLoadingType] = useState<ExportType | null>(null);
  const [activeReport, setActiveReport] = useState<ActiveReport | null>(null);

  const reportsConfig = [
    {
      id: "customers_debt" as ExportType,
      title: "Reporte de Cartera & Clientes Deudores",
      description:
        "Documento PDF con todos los clientes que tienen pagos pendientes, teléfonos, direcciones y cuotas vencidas.",
      icon: Users,
      badge: "PDF - Cartera & Cobros",
      badgeColor: "bg-rose-100 text-rose-800",
      buttonColor: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    {
      id: "inventory" as ExportType,
      title: "Reporte de Inventario de Zapatillas",
      description:
        "Documento PDF detallado por marca, modelo, colorway, tallas disponibles, stock físico y precio al contado.",
      icon: Footprints,
      badge: "PDF - Almacén",
      badgeColor: "bg-blue-100 text-blue-800",
      buttonColor: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      id: "payments" as ExportType,
      title: "Reporte de Historial de Cobranzas",
      description:
        "Documento PDF con el registro cronológico de recibos emitidos, cuotas cobradas, montos y medios de pago.",
      icon: Receipt,
      badge: "PDF - Recaudación",
      badgeColor: "bg-emerald-100 text-emerald-800",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
  ];

  const handleOpenPdfReport = async (type: ExportType, title: string, subtitle: string) => {
    try {
      setLoadingType(type);
      const data = await getExportData(type);
      if (!data || data.length === 0) {
        alert("No se encontraron registros para generar este reporte.");
        setLoadingType(null);
        return;
      }
      setActiveReport({ type, title, subtitle, data });
    } catch (error) {
      console.error("Error al cargar reporte:", error);
      alert("No se pudo generar el reporte en PDF");
    } finally {
      setLoadingType(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* 3 Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {reportsConfig.map((r) => {
          const Icon = r.icon;
          const isLoading = loadingType === r.id;

          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${r.badgeColor}`}
                  >
                    {r.badge}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">{r.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{r.description}</p>
              </div>

              <button
                onClick={() => handleOpenPdfReport(r.id, r.title, r.description)}
                disabled={loadingType !== null}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${r.buttonColor}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparando PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Ver y Descargar PDF</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL / VISOR DE PDF IMPRIMIBLE */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:static print:bg-white print:backdrop-blur-none">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
            {/* Modal Action Bar (Hidden in Print) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">{activeReport.title}</h3>
                  <p className="text-[11px] text-slate-300">
                    {activeReport.data.length} registros listos para exportar a PDF
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Guardar como PDF / Imprimir</span>
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENT CONTENT (PDF A4 STYLING) */}
            <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible">
              {/* PDF Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
                      N
                    </div>
                    <span className="font-black text-lg text-slate-900 tracking-tight">
                      SISTEMA NANCY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Créditos de Calzado & Préstamos en Efectivo
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <h2 className="text-base font-black text-slate-900 uppercase">
                    {activeReport.title}
                  </h2>
                  <p className="text-xs text-slate-500 capitalize">{todayStr}</p>
                </div>
              </div>

              {/* TABLE: DEBTORS */}
              {activeReport.type === "customers_debt" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                        <th className="p-2.5">Cliente</th>
                        <th className="p-2.5">Teléfono</th>
                        <th className="p-2.5">Dirección</th>
                        <th className="p-2.5 text-center">Score</th>
                        <th className="p-2.5 text-center">Cuotas Vencidas</th>
                        <th className="p-2.5 text-right">Deuda Activa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeReport.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{row.cliente}</td>
                          <td className="p-2.5 text-slate-600 font-mono">{row.telefono}</td>
                          <td className="p-2.5 text-slate-600">{row.direccion || "No especificada"}</td>
                          <td className="p-2.5 text-center font-bold">{row.calificacion}</td>
                          <td className="p-2.5 text-center">
                            {row.cuotasVencidas > 0 ? (
                              <span className="font-bold text-rose-600">{row.cuotasVencidas}</span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            S/ {row.deudaActiva}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABLE: INVENTORY */}
              {activeReport.type === "inventory" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                        <th className="p-2.5">Marca</th>
                        <th className="p-2.5">Modelo</th>
                        <th className="p-2.5">Color</th>
                        <th className="p-2.5 text-center">Talla</th>
                        <th className="p-2.5 text-center">Stock Físico</th>
                        <th className="p-2.5 text-right">Precio Contado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeReport.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{row.marca}</td>
                          <td className="p-2.5 text-slate-800">{row.modelo}</td>
                          <td className="p-2.5 text-slate-600">{row.color}</td>
                          <td className="p-2.5 text-center font-bold">{row.talla}</td>
                          <td className="p-2.5 text-center font-mono font-bold">{row.stock} pares</td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            S/ {row.precioContado}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABLE: PAYMENTS */}
              {activeReport.type === "payments" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-100 font-bold text-slate-700">
                        <th className="p-2.5">Recibo</th>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">Cliente</th>
                        <th className="p-2.5">Operación</th>
                        <th className="p-2.5 text-center">Cuota</th>
                        <th className="p-2.5">Medio</th>
                        <th className="p-2.5 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeReport.data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-amber-700">{row.recibo}</td>
                          <td className="p-2.5 text-slate-600">{row.fecha}</td>
                          <td className="p-2.5 font-bold text-slate-900">{row.cliente}</td>
                          <td className="p-2.5 text-slate-700">{row.operacion}</td>
                          <td className="p-2.5 text-center font-bold">#{row.cuotaNumero}</td>
                          <td className="p-2.5 text-slate-600">{row.medioPago}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                            S/ {row.monto}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PDF Footer / Signature */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span>Generado desde Sistema Nancy • Reporte Oficial</span>
                <span>Firma de Conformidad: ______________________</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
