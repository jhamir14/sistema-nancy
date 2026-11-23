import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PaymentFrequency } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateador de moneda (configurable con símbolo S/ o $)
export function formatCurrency(amount: number, currency: string = "S/"): string {
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency} ${formatted}`;
}

// Formateador de fechas
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

// Generador de fechas para cuotas Semanales, Quincenales o Mensuales
export function calculateDueDates(
  startDate: Date,
  installmentsCount: number,
  frequency: PaymentFrequency
): Date[] {
  const dates: Date[] = [];
  const base = new Date(startDate);

  for (let i = 1; i <= installmentsCount; i++) {
    const nextDate = new Date(base);
    if (frequency === "WEEKLY") {
      // Sumar semanas exactas (7 días por cada cuota)
      nextDate.setDate(base.getDate() + i * 7);
    } else if (frequency === "BIWEEKLY") {
      // Sumar quincenas exactas (15 días por cada cuota)
      nextDate.setDate(base.getDate() + i * 15);
    } else {
      // Mensual: Sumar meses exactos
      nextDate.setMonth(base.getMonth() + i);
    }
    dates.push(nextDate);
  }

  return dates;
}

// Generador de enlace directo a WhatsApp con mensaje personalizado
export function generateWhatsAppUrl(phone: string, message: string): string {
  // Limpiar cualquier caracter no numérico
  const cleanPhone = phone.replace(/\D/g, "");
  // Si no tiene código de país, asegurar formato internacional (Perú +51 por defecto o según prefijo)
  const fullPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}
