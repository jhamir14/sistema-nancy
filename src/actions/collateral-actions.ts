"use server";

import { prisma } from "@/lib/prisma";

export interface CollateralItem {
  loanId: string;
  loanCode: string;
  collateralDescription: string;
  principalAmount: number;
  totalAmount: number;
  remainingDebt: number;
  loanStatus: string;
  disbursementDate: Date;
  customer: {
    id: string;
    fullName: string;
    documentNumber?: string | null;
    phone: string;
    address?: string | null;
  };
  custodyStatus: "IN_CUSTODY" | "READY_TO_RETURN" | "AT_RISK";
  overdueInstallments: number;
}

export async function getCollateralItems(): Promise<CollateralItem[]> {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        AND: [
          { collateral: { not: null } },
          { collateral: { not: "" } },
        ],
      },
      include: {
        customer: true,
        installments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return loans.map((loan) => {
      let remainingDebt = 0;
      let overdueInstallments = 0;

      loan.installments.forEach((inst) => {
        if (inst.status !== "PAID") {
          remainingDebt += inst.expectedAmount + inst.penaltyAmount - inst.paidAmount;
          if (new Date(inst.dueDate) < new Date()) {
            overdueInstallments++;
          }
        }
      });

      let custodyStatus: "IN_CUSTODY" | "READY_TO_RETURN" | "AT_RISK" = "IN_CUSTODY";

      if (loan.status === "PAID" || remainingDebt <= 0.05) {
        custodyStatus = "READY_TO_RETURN";
      } else if (overdueInstallments > 0 || loan.status === "DEFAULTED") {
        custodyStatus = "AT_RISK";
      } else {
        custodyStatus = "IN_CUSTODY";
      }

      return {
        loanId: loan.id,
        loanCode: loan.loanCode,
        collateralDescription: loan.collateral || "Sin descripción de prenda",
        principalAmount: loan.principalAmount,
        totalAmount: loan.totalAmount,
        remainingDebt,
        loanStatus: loan.status,
        disbursementDate: loan.disbursementDate,
        customer: {
          id: loan.customer.id,
          fullName: `${loan.customer.firstName} ${loan.customer.lastName}`,
          documentNumber: loan.customer.documentNumber,
          phone: loan.customer.phone,
          address: loan.customer.address,
        },
        custodyStatus,
        overdueInstallments,
      };
    });
  } catch (error) {
    console.error("Error al obtener prendas en custodia:", error);
    return [];
  }
}
