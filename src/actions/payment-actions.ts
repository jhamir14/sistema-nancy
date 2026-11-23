"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface RegisterPaymentInput {
  installmentId: string;
  amount: number;
  paymentMethod?: string;
  referenceCode?: string;
  notes?: string;
  collectedBy?: string;
}

export async function registerPayment(data: RegisterPaymentInput) {
  try {
    const paymentAmount = Number(data.amount);
    if (paymentAmount <= 0) {
      return { success: false, error: "El monto a cobrar debe ser mayor a 0" };
    }

    const installment = await prisma.installment.findUnique({
      where: { id: data.installmentId },
      include: {
        loan: { include: { customer: true, installments: true } },
        shoeCredit: { include: { customer: true, installments: true } },
      },
    });

    if (!installment) {
      return { success: false, error: "Cuota no encontrada" };
    }

    const customer = installment.loan?.customer || installment.shoeCredit?.customer;
    if (!customer) {
      return { success: false, error: "Cliente asociado no encontrado" };
    }

    const remainingOnInstallment =
      installment.expectedAmount + installment.penaltyAmount - installment.paidAmount;

    if (paymentAmount > remainingOnInstallment + 0.05) {
      return {
        success: false,
        error: `El monto ingresado excede el saldo pendiente de esta cuota (${remainingOnInstallment.toFixed(2)})`,
      };
    }

    // Generar correlativo de recibo
    const year = new Date().getFullYear();
    const paymentsCount = await prisma.payment.count();
    const receiptNumber = `REC-${year}-${String(paymentsCount + 1).padStart(5, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el registro del Pago
      const payment = await tx.payment.create({
        data: {
          receiptNumber,
          installmentId: installment.id,
          customerId: customer.id,
          amount: paymentAmount,
          paymentMethod: data.paymentMethod || "CASH",
          referenceCode: data.referenceCode?.trim() || null,
          collectedBy: data.collectedBy || "Administrador",
          notes: data.notes?.trim() || null,
        },
      });

      // 2. Actualizar el estado de la cuota
      const newPaidAmount = installment.paidAmount + paymentAmount;
      const isFullyPaid = newPaidAmount >= installment.expectedAmount + installment.penaltyAmount - 0.01;

      const updatedInstallment = await tx.installment.update({
        where: { id: installment.id },
        data: {
          paidAmount: newPaidAmount,
          status: isFullyPaid ? "PAID" : "PARTIAL",
          paidAt: isFullyPaid ? new Date() : null,
        },
      });

      // 3. Verificar si se completaron todas las cuotas del préstamo o crédito
      if (installment.loanId && installment.loan) {
        const allLoanInstallments = installment.loan.installments;
        const otherAllPaid = allLoanInstallments
          .filter((i) => i.id !== installment.id)
          .every((i) => i.status === "PAID");

        if (isFullyPaid && otherAllPaid) {
          await tx.loan.update({
            where: { id: installment.loanId },
            data: { status: "PAID" },
          });
        }
      } else if (installment.shoeCreditId && installment.shoeCredit) {
        const allCreditInstallments = installment.shoeCredit.installments;
        const otherAllPaid = allCreditInstallments
          .filter((i) => i.id !== installment.id)
          .every((i) => i.status === "PAID");

        if (isFullyPaid && otherAllPaid) {
          await tx.shoeCredit.update({
            where: { id: installment.shoeCreditId },
            data: { status: "PAID" },
          });
        }
      }

      // 4. Registrar movimiento de ingreso en la caja
      await tx.cashTransaction.create({
        data: {
          type: "INCOME",
          category: "PAYMENT_COLLECTION",
          amount: paymentAmount,
          description: `Cobro cuota #${installment.installmentNumber} (${receiptNumber}) - Cliente: ${customer.firstName} ${customer.lastName}`,
          referenceId: payment.id,
        },
      });

      return { payment, updatedInstallment, customer };
    });

    revalidatePath("/cobranzas");
    revalidatePath("/prestamos");
    revalidatePath("/creditos");
    revalidatePath("/clientes");
    revalidatePath("/");

    return { success: true, ...result };
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return { success: false, error: "Ocurrió un error al procesar el cobro" };
  }
}

export async function getUpcomingInstallments() {
  try {
    return await prisma.installment.findMany({
      where: {
        status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
      },
      include: {
        loan: { include: { customer: true } },
        shoeCredit: {
          include: {
            customer: true,
            items: { include: { shoeVariant: { include: { shoe: true } } } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });
  } catch (error) {
    console.error("Error al obtener cuotas:", error);
    throw new Error("No se pudieron cargar las cuotas por cobrar");
  }
}
