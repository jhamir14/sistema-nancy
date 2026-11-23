// Frecuencias de pago autorizadas para el sistema
export type PaymentFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export const PAYMENT_FREQUENCIES: { value: PaymentFrequency; label: string; daysInterval: number }[] = [
  { value: 'WEEKLY', label: 'Semanal (7 días)', daysInterval: 7 },
  { value: 'BIWEEKLY', label: 'Quincenal (15 días)', daysInterval: 15 },
  { value: 'MONTHLY', label: 'Mensual (30 días)', daysInterval: 30 },
];

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quincenal',
  MONTHLY: 'Mensual',
};

// Estados de cuota
export type InstallmentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  PARTIAL: { label: 'Abono Parcial', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  PAID: { label: 'Pagada', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  OVERDUE: { label: 'Vencida / En Mora', color: 'bg-rose-100 text-rose-800 border-rose-300' },
};

// Estados y calificación de clientes
export type CreditScore = 'EXCELLENT' | 'GOOD' | 'REGULAR' | 'DEFICIENT';

export const CREDIT_SCORE_LABELS: Record<CreditScore, { label: string; color: string; badge: string }> = {
  EXCELLENT: { label: 'Excelente', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  GOOD: { label: 'Bueno', color: 'text-blue-600', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  REGULAR: { label: 'Regular', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  DEFICIENT: { label: 'Moroso / Riesgo', color: 'text-rose-600', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
};

// Métodos de pago
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'CARD' | 'OTHER';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  BANK_TRANSFER: 'Transferencia Bancaria',
  DIGITAL_WALLET: 'Billetera Digital (Yape / Plin)',
  CARD: 'Tarjeta',
  OTHER: 'Otro',
};
