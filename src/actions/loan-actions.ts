"use server";

import { prisma } from "@/lib/prisma";
import { calculateDueDates } from "@/lib/utils";
import { PaymentFrequency } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface CreateLoanInput {
  customerId: string;
  principalAmount: number;   // Monto que se entrega en mano
  interestRate: number;      // % interés total acordado (ej. 15%)
  frequency: PaymentFrequency; // 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  installmentsCount: number; // Ej. 4 cuotas semanales o 2 cuotas mensuales
  startDate: string;         // Fecha de desembolso (YYYY-MM-DD)
  collateral?: string;       // Prenda o garantía
  notes?: string;
}

export async function getLoans() {
  try {
    return await prisma.loan.findMany({
      include: {
        customer: true,
        installments: {
          include: { payments: true },
          orderBy: { installmentNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error al obtener préstamos:", error);
    throw new Error("No se pudo obtener la lista de préstamos");
  }
}

export async function getLoanById(id: string) {
  try {
    return await prisma.loan.findUnique({
      where: { id },
      include: {
        customer: true,
        installments: {
          include: { payments: true },
          orderBy: { installmentNumber: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener préstamo por ID:", error);
    throw new Error("No se pudo obtener el detalle del préstamo");
  }
}

export async function createLoan(data: CreateLoanInput) {
  try {
    if (data.principalAmount <= 0) {
      return { success: false, error: "El monto a prestar debe ser mayor a 0" };
    }
    if (data.installmentsCount <= 0) {
      return { success: false, error: "El número de cuotas debe ser al menos 1" };
    }
    if (data.frequency !== "WEEKLY" && data.frequency !== "BIWEEKLY" && data.frequency !== "MONTHLY") {
      return { success: false, error: "La frecuencia de pago debe ser Semanal, Quincenal o Mensual" };
    }

    // Cálculos financieros
    const principal = Number(data.principalAmount);
    const rate = Number(data.interestRate);
    const totalInterest = (principal * rate) / 100;
    const totalAmount = principal + totalInterest;
    const amountPerInstallment = Number((totalAmount / data.installmentsCount).toFixed(2));

    // Generar correlativo
    const count = await prisma.loan.count();
    const loanCode = `PRE-${String(count + 1).padStart(4, "0")}`;

    // Fechas de vencimiento
    const start = new Date(data.startDate || new Date());
    const dueDates = calculateDueDates(start, data.installmentsCount, data.frequency);

    const loan = await prisma.$transaction(async (tx) => {
      // 1. Crear el préstamo
      const createdLoan = await tx.loan.create({
        data: {
          loanCode,
          customerId: data.customerId,
          principalAmount: principal,
          interestRate: rate,
          totalInterest,
          totalAmount,
          frequency: data.frequency,
          installmentsCount: data.installmentsCount,
          disbursementDate: start,
          firstDueDate: dueDates[0],
          collateral: data.collateral?.trim() || null,
          status: "ACTIVE",
          notes: data.notes?.trim() || null,
          installments: {
            create: dueDates.map((date, idx) => ({
              installmentNumber: idx + 1,
              dueDate: date,
              expectedAmount: amountPerInstallment,
              paidAmount: 0,
              penaltyAmount: 0,
              status: "PENDING",
            })),
          },
        },
        include: { customer: true, installments: true },
      });

      // 2. Registrar egreso de caja por desembolso de préstamo
      await tx.cashTransaction.create({
        data: {
          type: "EXPENSE",
          category: "LOAN_DISBURSEMENT",
          amount: principal,
          description: `Desembolso de préstamo ${loanCode} al cliente ${createdLoan.customer.firstName} ${createdLoan.customer.lastName}`,
          referenceId: createdLoan.id,
        },
      });

      return createdLoan;
    });

    revalidatePath("/prestamos");
    revalidatePath("/cobranzas");
    revalidatePath("/");
    return { success: true, loan };
  } catch (error) {
    console.error("Error al crear préstamo:", error);
    return { success: false, error: "Ocurrió un error al registrar el préstamo" };
  }
}
