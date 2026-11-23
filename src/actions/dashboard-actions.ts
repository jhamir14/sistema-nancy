"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardMetrics() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Ejecutar todas las consultas de forma concurrente con Promise.all para máxima velocidad
    const [
      variants,
      loans,
      shoeCredits,
      payments,
      allPendingInstallments,
      customersCount,
      shoesCount,
      recentCashTransactions,
    ] = await Promise.all([
      // 1. Variantes de calzado y stock
      prisma.shoeVariant.findMany({
        include: { shoe: true },
      }),
      // 2. Préstamos en efectivo activos
      prisma.loan.findMany({
        where: { status: "ACTIVE" },
        include: { installments: true },
      }),
      // 3. Créditos de calzado activos
      prisma.shoeCredit.findMany({
        where: { status: "ACTIVE" },
        include: {
          items: true,
          installments: true,
        },
      }),
      // 4. Pagos registrados
      prisma.payment.findMany({
        select: {
          amount: true,
          paymentDate: true,
        },
      }),
      // 5. Cuotas pendientes y por vencer
      prisma.installment.findMany({
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
      }),
      // 6. Contador de clientes activos
      prisma.customer.count({ where: { status: "ACTIVE" } }),
      // 7. Contador de modelos de zapatillas
      prisma.shoe.count({ where: { isActive: true } }),
      // 8. Movimientos recientes de caja
      prisma.cashTransaction.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // 1. Cálculos de calzado e inversión en stock
    let totalInvestedInShoeStock = 0;
    let totalPhysicalPairsInStock = 0;
    let lowStockCount = 0;

    variants.forEach((v) => {
      totalPhysicalPairsInStock += v.stock;
      totalInvestedInShoeStock += v.stock * v.shoe.purchasePrice;
      if (v.stock <= v.minStockAlert) lowStockCount++;
    });

    // 2. Préstamos en efectivo
    let totalCapitalInActiveLoans = 0;
    let totalReceivableFromLoans = 0;

    loans.forEach((l) => {
      totalCapitalInActiveLoans += l.principalAmount;
      l.installments.forEach((inst) => {
        if (inst.status !== "PAID") {
          totalReceivableFromLoans += inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
        }
      });
    });

    // 3. Créditos de zapatillas
    let totalCostOfShoesInActiveCredits = 0;
    let totalReceivableFromShoeCredits = 0;

    shoeCredits.forEach((sc) => {
      sc.items.forEach((item) => {
        totalCostOfShoesInActiveCredits += item.quantity * item.unitCost;
      });
      sc.installments.forEach((inst) => {
        if (inst.status !== "PAID") {
          totalReceivableFromShoeCredits += inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
        }
      });
    });

    // 4. Gran Total de Dinero Invertido
    const totalMoneyInvested =
      totalInvestedInShoeStock + totalCapitalInActiveLoans + totalCostOfShoesInActiveCredits;

    // 5. Total de Cartera por Cobrar (Dinero en la calle)
    const totalReceivable = totalReceivableFromLoans + totalReceivableFromShoeCredits;

    // 6. Recaudación y Cobranzas
    let totalCollectedAllTime = 0;
    let totalCollectedThisMonth = 0;
    let totalCollectedToday = 0;

    payments.forEach((p) => {
      totalCollectedAllTime += p.amount;
      const pDate = new Date(p.paymentDate);
      if (pDate >= startOfMonth) {
        totalCollectedThisMonth += p.amount;
      }
      if (pDate >= startOfToday) {
        totalCollectedToday += p.amount;
      }
    });

    // 7. Cuotas que vencen hoy, cuotas vencidas y por cobrar pronto
    let totalDueToday = 0;
    let countDueToday = 0;
    let totalOverdueAmount = 0;
    let overdueInstallmentsCount = 0;
    const dueTodayOrSoon: typeof allPendingInstallments = [];

    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysFromNow = new Date(startOfToday);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    allPendingInstallments.forEach((inst) => {
      const remaining = inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
      const due = new Date(inst.dueDate);

      if (due < startOfToday) {
        totalOverdueAmount += remaining;
        overdueInstallmentsCount++;
      } else if (due <= endOfToday) {
        totalDueToday += remaining;
        countDueToday++;
        dueTodayOrSoon.push(inst);
      } else if (due <= sevenDaysFromNow) {
        dueTodayOrSoon.push(inst);
      }
    });

    // 8. Datos para Gráfica de Cobranzas Mensuales (Últimos 6 meses)
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
    const monthlyCollection: { month: string; total: number; count: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextM = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

      const monthPayments = payments.filter((p) => {
        const pd = new Date(p.paymentDate);
        return pd >= d && pd < nextM;
      });

      const total = monthPayments.reduce((acc, p) => acc + p.amount, 0);
      monthlyCollection.push({ month: label, total, count: monthPayments.length });
    }

    // 9. Distribución de Marcas de Calzado en Stock
    const brandMap: Record<string, { brand: string; pairs: number; invested: number }> = {};
    variants.forEach((v) => {
      const b = v.shoe.brand.trim();
      if (!brandMap[b]) {
        brandMap[b] = { brand: b, pairs: 0, invested: 0 };
      }
      brandMap[b].pairs += v.stock;
      brandMap[b].invested += v.stock * v.shoe.purchasePrice;
    });
    const brandDistribution = Object.values(brandMap).sort((a, b) => b.pairs - a.pairs);

    return {
      totalMoneyInvested,
      totalInvestedInShoeStock,
      totalCapitalInActiveLoans,
      totalCostOfShoesInActiveCredits,
      totalPhysicalPairsInStock,
      totalReceivable,
      totalReceivableFromLoans,
      totalReceivableFromShoeCredits,
      totalDueToday,
      countDueToday,
      totalCollectedToday,
      totalCollectedThisMonth,
      totalCollectedAllTime,
      totalOverdueAmount,
      overdueInstallmentsCount,
      customersCount,
      shoesCount,
      activeLoansCount: loans.length,
      activeCreditsCount: shoeCredits.length,
      lowStockCount,
      dueTodayOrSoon: dueTodayOrSoon.slice(0, 10),
      recentCashTransactions,
      monthlyCollection,
      brandDistribution,
    };
  } catch (error) {
    console.error("Error al obtener métricas del dashboard:", error);
    throw new Error("No se pudieron cargar las estadísticas financieras");
  }
}
