"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateManualTransactionInput {
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string;
  registeredBy?: string;
}

export async function getCashSummary(targetDateStr?: string) {
  try {
    const baseDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startOfDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const endOfDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59, 999);

    // 1. Obtener movimientos de caja del día
    const transactions = await prisma.cashTransaction.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === "INCOME") totalIncome += tx.amount;
      if (tx.type === "EXPENSE") totalExpense += tx.amount;
    });

    // 2. Desglose de ingresos por método de pago (de los pagos de cuotas cobrados hoy)
    const paymentsToday = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let cashPhysical = 0;
    let digitalWallet = 0;
    let bankTransfer = 0;
    let cardOrOther = 0;

    paymentsToday.forEach((p) => {
      if (p.paymentMethod === "CASH") cashPhysical += p.amount;
      else if (p.paymentMethod === "DIGITAL_WALLET") digitalWallet += p.amount;
      else if (p.paymentMethod === "BANK_TRANSFER") bankTransfer += p.amount;
      else cardOrOther += p.amount;
    });

    // Sumar enganches en efectivo de hoy si no están en payments
    const downPaymentsToday = transactions.filter((t) => t.category === "DOWN_PAYMENT");
    downPaymentsToday.forEach((dp) => {
      cashPhysical += dp.amount;
    });

    const netBalance = totalIncome - totalExpense;

    return {
      date: startOfDay,
      totalIncome,
      totalExpense,
      netBalance,
      cashPhysical,
      digitalWallet,
      bankTransfer,
      cardOrOther,
      transactions,
      paymentsCount: paymentsToday.length,
    };
  } catch (error) {
    console.error("Error al obtener resumen de caja:", error);
    throw new Error("No se pudo obtener el arqueo de caja");
  }
}

export async function createManualTransaction(data: CreateManualTransactionInput) {
  try {
    if (data.amount <= 0) {
      return { success: false, error: "El monto debe ser mayor a 0" };
    }
    if (!data.description.trim()) {
      return { success: false, error: "Ingresa una descripción del movimiento" };
    }

    const tx = await prisma.cashTransaction.create({
      data: {
        type: data.type,
        category: data.category || (data.type === "INCOME" ? "EXTRA_INCOME" : "EXTRA_EXPENSE"),
        amount: Number(data.amount),
        description: data.description.trim(),
        registeredBy: data.registeredBy || "Administrador",
      },
    });

    revalidatePath("/caja");
    revalidatePath("/cobranzas");
    revalidatePath("/");
    return { success: true, transaction: tx };
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    return { success: false, error: "Ocurrió un error al registrar el movimiento" };
  }
}

export async function getExportData(type: "customers_debt" | "inventory" | "payments") {
  try {
    if (type === "customers_debt") {
      const customers = await prisma.customer.findMany({
        include: {
          loans: {
            where: { status: { in: ["ACTIVE", "DEFAULTED"] } },
            include: { installments: true },
          },
          shoeCredits: {
            where: { status: { in: ["ACTIVE", "DEFAULTED"] } },
            include: { installments: true },
          },
        },
      });

      return customers
        .map((c) => {
          let totalDebt = 0;
          let overdueInstallments = 0;

          c.loans.forEach((l) => {
            l.installments.forEach((inst) => {
              if (inst.status !== "PAID") {
                totalDebt += inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
                if (new Date(inst.dueDate) < new Date()) overdueInstallments++;
              }
            });
          });

          c.shoeCredits.forEach((sc) => {
            sc.installments.forEach((inst) => {
              if (inst.status !== "PAID") {
                totalDebt += inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
                if (new Date(inst.dueDate) < new Date()) overdueInstallments++;
              }
            });
          });

          return {
            documento: `${c.documentType}: ${c.documentNumber}`,
            cliente: `${c.firstName} ${c.lastName}`,
            telefono: c.phone,
            direccion: c.address,
            calificacion: c.creditScore,
            deudaActiva: totalDebt.toFixed(2),
            cuotasVencidas: overdueInstallments,
            garante: c.guarantorName || "Sin garante",
          };
        })
        .filter((c) => Number(c.deudaActiva) > 0);
    }

    if (type === "inventory") {
      const shoes = await prisma.shoe.findMany({
        include: { variants: true },
      });

      const rows: any[] = [];
      shoes.forEach((s) => {
        s.variants.forEach((v) => {
          rows.push({
            marca: s.brand,
            modelo: s.model,
            categoria: s.category || "Urbana",
            talla: v.size,
            color: v.colorway,
            stock: v.stock,
            costoUnitario: s.purchasePrice.toFixed(2),
            precioContado: s.cashPrice.toFixed(2),
            precioCredito: s.creditPrice.toFixed(2),
            inversionTotal: (v.stock * s.purchasePrice).toFixed(2),
          });
        });
      });
      return rows;
    }

    if (type === "payments") {
      const payments = await prisma.payment.findMany({
        include: {
          customer: true,
          installment: {
            include: {
              loan: true,
              shoeCredit: true,
            },
          },
        },
        orderBy: { paymentDate: "desc" },
        take: 500,
      });

      return payments.map((p) => {
        const code = p.installment.loan?.loanCode || p.installment.shoeCredit?.creditCode || "-";
        const type = p.installment.loan ? "Préstamo" : "Crédito Calzado";

        return {
          recibo: p.receiptNumber,
          fecha: new Date(p.paymentDate).toLocaleDateString("es-PE"),
          cliente: `${p.customer.firstName} ${p.customer.lastName}`,
          documento: p.customer.documentNumber,
          operacion: `${type} (${code})`,
          cuotaNumero: p.installment.installmentNumber,
          monto: p.amount.toFixed(2),
          medioPago: p.paymentMethod,
          voucher: p.referenceCode || "-",
          cajero: p.collectedBy,
        };
      });
    }

    return [];
  } catch (error) {
    console.error("Error al exportar datos:", error);
    throw new Error("No se pudo generar el reporte de exportación");
  }
}

export async function getDailyDueInstallments(targetDateStr?: string) {
  try {
    const baseDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startOfDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
    const endOfDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59, 999);

    const installments = await prisma.installment.findMany({
      where: {
        status: { in: ["PENDING", "PARTIAL", "OVERDUE"] },
        dueDate: { lte: endOfDay },
      },
      include: {
        loan: {
          include: { customer: true },
        },
        shoeCredit: {
          include: {
            customer: true,
            items: {
              include: {
                shoeVariant: {
                  include: { shoe: true },
                },
              },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Pagos registrados hoy
    const paymentsToday = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: { amount: true },
    });
    const totalCollectedToday = paymentsToday.reduce((sum, p) => sum + p.amount, 0);

    const items = installments.map((inst) => {
      const remainingAmount = Number((inst.expectedAmount + inst.penaltyAmount - inst.paidAmount).toFixed(2));
      const isLoan = !!inst.loan;
      const customer = isLoan ? inst.loan?.customer : inst.shoeCredit?.customer;
      const code = isLoan ? inst.loan?.loanCode : inst.shoeCredit?.creditCode;
      const totalCount = isLoan ? inst.loan?.installmentsCount : inst.shoeCredit?.installmentsCount;

      let itemDescription = "Préstamo en Efectivo";
      if (!isLoan && inst.shoeCredit?.items?.length) {
        const shoeNames = inst.shoeCredit.items
          .map((it) => `${it.shoeVariant.shoe.brand} ${it.shoeVariant.shoe.model} (T.${it.shoeVariant.size})`)
          .join(", ");
        itemDescription = shoeNames || "Calzado a Crédito";
      }

      const isToday = inst.dueDate >= startOfDay && inst.dueDate <= endOfDay;
      const isOverdue = inst.dueDate < startOfDay;

      const cleanPhone = customer?.phone?.replace(/\D/g, "") || "";
      const waPhone = cleanPhone.startsWith("51") ? cleanPhone : `51${cleanPhone}`;

      const waText = encodeURIComponent(
        `Hola ${customer?.firstName || ""}, te saluda Nancy. Te recuerdo cordialmente que ${
          isToday ? "hoy" : "tienes pendiente"
        } tu cuota #${inst.installmentNumber} de S/ ${remainingAmount.toFixed(2)} por concepto de ${itemDescription} (${code}). Quedo atenta para coordinar tu pago. ¡Muchas gracias!`
      );

      return {
        id: inst.id,
        installmentNumber: inst.installmentNumber,
        totalInstallments: totalCount || 1,
        dueDate: inst.dueDate,
        expectedAmount: inst.expectedAmount,
        paidAmount: inst.paidAmount,
        penaltyAmount: inst.penaltyAmount,
        remainingAmount,
        isToday,
        isOverdue,
        type: isLoan ? ("LOAN" as const) : ("SHOE_CREDIT" as const),
        code: code || "",
        customer: customer
          ? {
              id: customer.id,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              documentNumber: customer.documentNumber,
              address: customer.address,
            }
          : null,
        itemDescription,
        whatsAppLink: cleanPhone ? `https://wa.me/${waPhone}?text=${waText}` : null,
      };
    });

    const dueTodayList = items.filter((it) => it.isToday);
    const overdueList = items.filter((it) => it.isOverdue);

    const totalToCollectToday = dueTodayList.reduce((acc, it) => acc + it.remainingAmount, 0);
    const totalOverdue = overdueList.reduce((acc, it) => acc + it.remainingAmount, 0);

    return {
      date: startOfDay,
      items,
      dueTodayList,
      overdueList,
      totalToCollectToday,
      totalOverdue,
      grandTotalPending: totalToCollectToday + totalOverdue,
      totalCollectedToday,
      countDueToday: dueTodayList.length,
      countOverdue: overdueList.length,
      totalCount: items.length,
    };
  } catch (error) {
    console.error("Error al obtener cobranzas del día:", error);
    throw new Error("No se pudo obtener la lista de cobranzas del día");
  }
}
