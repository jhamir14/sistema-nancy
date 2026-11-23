"use client";

import { useState } from "react";
import { getExportData } from "@/actions/cash-actions";
import {
  FileSpreadsheet,
  Download,
  Users,
  Footprints,
  Receipt,
  Loader2,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from "lucide-react";

type ExportType = "customers_debt" | "inventory" | "payments";

export function ExportCenter() {
  const [downloading, setDownloading] = useState<ExportType | null>(null);
  const [lastExported, setLastExported] = useState<string | null>(null);

  const downloadCSV = async (type: ExportType, fileName: string) => {
    try {
      setDownloading(type);

      const data = await getExportData(type);
      if (!data || data.length === 0) {
        alert("No hay datos disponibles para exportar en este reporte.");
        setDownloading(null);
        return;
      }

      // Convert array of objects to CSV with headers
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];

      for (const row of data as any[]) {
        const values = headers.map((header) => {
          const val = row[header] ?? "";
          const escaped = ("" + val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }

      // Prepend UTF-8 BOM so Excel opens it with proper encoding on Windows
      const csvContent = "\uFEFF" + csvRows.join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];

      link.setAttribute("href", url);
      link.setAttribute("download", `${fileName}_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastExported(`${fileName} (${data.length} registros)`);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Ocurrió un error al generar la exportación");
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      id: "customers_debt" as ExportType,
      title: "Cartera Activa y Deudores Morosos",
      description:
        "Lista detallada de clientes con saldo pendiente, cuotas vencidas, teléfonos y avales para cobranza de campo.",
      fileName: "Cartera_Clientes_Deudores_Nancy",
      icon: Users,
      badge: "Gestión de Cobranzas",
      badgeColor: "bg-rose-100 text-rose-700",
      buttonColor: "bg-rose-600 hover:bg-rose-700",
    },
    {
      id: "inventory" as ExportType,
      title: "Inventario Valorizado de Zapatillas",
      description:
        "Desglose por marca, modelo, colorway y talla con conteo de stock físico, costo unitario y capital total invertido.",
      fileName: "Inventario_Valorizado_Nancy",
      icon: Footprints,
      badge: "Auditoría de Almacén",
      badgeColor: "bg-blue-100 text-blue-700",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      id: "payments" as ExportType,
      title: "Historial de Cobranzas y Recibos",
      description:
        "Registro de todos los pagos ingresados, número de recibo oficial, cliente, medio de pago (Yape/Efectivo/Banco) y cajero.",
      fileName: "Historial_Cobranzas_Recibos_Nancy",
      icon: Receipt,
      badge: "Contabilidad & Arqueo",
      badgeColor: "bg-emerald-100 text-emerald-700",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      {lastExported && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Archivo descargado exitosamente: <strong>{lastExported}</strong>. Es compatible al 100%
            con Microsoft Excel.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          const isCurrentLoading = downloading === r.id;

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
                onClick={() => downloadCSV(r.id, r.fileName)}
                disabled={downloading !== null}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${r.buttonColor}`}
              >
                {isCurrentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando Archivo...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Descargar CSV / Excel</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info card */}
      <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div className="text-xs text-amber-900 space-y-1">
          <h4 className="font-bold text-sm text-amber-950">
            Formato Universal para Microsoft Excel y Google Sheets
          </h4>
          <p className="text-amber-800 leading-relaxed">
            Todos los reportes generados contienen codificación UTF-8 con BOM. Al abrirlos en Excel,
            los caracteres en español (tildes, letras ñ y símbolo de Soles S/.) se muestran sin
            alteraciones ni errores de caracteres.
          </p>
        </div>
      </div>
    </div>
  );
}
