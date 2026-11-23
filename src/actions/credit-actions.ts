"use server";

import { prisma } from "@/lib/prisma";
import { calculateDueDates } from "@/lib/utils";
import { PaymentFrequency } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface ShoeCreditItemInput {
  shoeVariantId: string;
  quantity: number;
}

export interface CreateShoeCreditInput {
  customerId: string;
  items: ShoeCreditItemInput[];
  downPayment: number;       // Inicial
  interestRate?: number;     // Interés (%) adicional sobre el saldo
  frequency: PaymentFrequency; // 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  installmentsCount: number; // Número de cuotas
  startDate: string;         // Fecha de entrega (YYYY-MM-DD)
  notes?: string;
}

export async function getShoeCredits() {
  try {
    return await prisma.shoeCredit.findMany({
      include: {
        customer: true,
        items: {
          include: {
            shoeVariant: {
              include: { shoe: true },
            },
          },
        },
        installments: {
          include: { payments: true },
          orderBy: { installmentNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error al obtener créditos de zapatillas:", error);
    throw new Error("No se pudo obtener la lista de créditos");
  }
}

export async function getShoeCreditById(id: string) {
  try {
    return await prisma.shoeCredit.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            shoeVariant: {
              include: { shoe: true },
            },
          },
        },
        installments: {
          include: { payments: true },
          orderBy: { installmentNumber: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener crédito por ID:", error);
    throw new Error("No se pudo obtener el detalle del crédito de calzado");
  }
}

export async function createShoeCredit(data: CreateShoeCreditInput) {
  try {
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Debes seleccionar al menos un par de zapatillas" };
    }
    if (data.installmentsCount <= 0) {
      return { success: false, error: "El número de cuotas debe ser al menos 1" };
    }

    // 1. Obtener variantes y verificar stock y precios
    const variantIds = data.items.map((i) => i.shoeVariantId);
    const variants = await prisma.shoeVariant.findMany({
      where: { id: { in: variantIds } },
      include: { shoe: true },
    });

    let totalSaleAmount = 0;
    const validatedItems: {
      shoeVariantId: string;
      quantity: number;
      unitCost: number;
      unitCreditPrice: number;
    }[] = [];

    for (const item of data.items) {
      const variant = variants.find((v) => v.id === item.shoeVariantId);
      if (!variant) {
        return { success: false, error: `Variante no encontrada: ${item.shoeVariantId}` };
      }
      if (variant.stock < item.quantity) {
        return {
          success: false,
          error: `Stock insuficiente para ${variant.shoe.brand} ${variant.shoe.model} (Talla: ${variant.size}). Disponibles: ${variant.stock}`,
        };
      }

      // Se usa el precio normal al contado
      const unitPrice = variant.shoe.cashPrice;
      const itemTotal = unitPrice * item.quantity;
      totalSaleAmount += itemTotal;

      validatedItems.push({
        shoeVariantId: variant.id,
        quantity: item.quantity,
        unitCost: variant.shoe.purchasePrice || 0,
        unitCreditPrice: unitPrice,
      });
    }

    const downPayment = Math.max(0, Number(data.downPayment || 0));
    const baseFinanced = Math.max(0, totalSaleAmount - downPayment);

    if (baseFinanced <= 0) {
      return {
        success: false,
        error: "La inicial no puede cubrir el total del calzado; para venta directa de contado usa otra modalidad.",
      };
    }

    // Cálculo del interés opcional sobre el saldo
    const interestRate = Math.max(0, Number(data.interestRate || 0));
    const totalInterest = (baseFinanced * interestRate) / 100;
    const financedAmount = Number((baseFinanced + totalInterest).toFixed(2));
    const amountPerInstallment = Number((financedAmount / data.installmentsCount).toFixed(2));

    // Generar correlativo
    const count = await prisma.shoeCredit.count();
    const creditCode = `CRZ-${String(count + 1).padStart(4, "0")}`;

    // Fechas de vencimiento
    const start = new Date(data.startDate || new Date());
    const dueDates = calculateDueDates(start, data.installmentsCount, data.frequency);

    const credit = await prisma.$transaction(async (tx) => {
      // A. Descontar stock de cada variante
      for (const item of validatedItems) {
        await tx.shoeVariant.update({
          where: { id: item.shoeVariantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // B. Crear el crédito con sus cuotas
      const createdCredit = await tx.shoeCredit.create({
        data: {
          creditCode,
          customerId: data.customerId,
          totalSaleAmount,
          downPayment,
          interestRate,
          totalInterest,
          financedAmount,
          frequency: data.frequency,
          installmentsCount: data.installmentsCount,
          startDate: start,
          status: "ACTIVE",
          notes: data.notes?.trim() || null,
          items: {
            create: validatedItems.map((vi) => ({
              shoeVariantId: vi.shoeVariantId,
              quantity: vi.quantity,
              unitCost: vi.unitCost,
              unitCreditPrice: vi.unitCreditPrice,
            })),
          },
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
        include: { customer: true, items: true, installments: true },
      });

      // C. Si hubo enganche/inicial, registrar ingreso de caja inmediato
      if (downPayment > 0) {
        await tx.cashTransaction.create({
          data: {
            type: "INCOME",
            category: "DOWN_PAYMENT",
            amount: downPayment,
            description: `Enganche / Inicial por crédito ${creditCode} de ${createdCredit.customer.firstName} ${createdCredit.customer.lastName}`,
            referenceId: createdCredit.id,
          },
        });
      }

      return createdCredit;
    });

    revalidatePath("/creditos");
    revalidatePath("/zapatillas");
    revalidatePath("/cobranzas");
    revalidatePath("/");
    return { success: true, credit };
  } catch (error) {
    console.error("Error al registrar crédito de zapatillas:", error);
    return { success: false, error: "Ocurrió un error al registrar el crédito de calzado" };
  }
}
