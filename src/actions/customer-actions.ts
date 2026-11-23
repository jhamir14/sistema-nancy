"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateCustomerInput {
  documentType?: string;
  documentNumber?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string | null;
  creditScore?: string;
}

export async function getCustomers(search?: string) {
  try {
    const whereClause = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { documentNumber: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        loans: {
          select: {
            id: true,
            status: true,
            installments: {
              where: { status: { not: "PAID" } },
              select: {
                expectedAmount: true,
                paidAmount: true,
                status: true,
              },
            },
          },
        },
        shoeCredits: {
          select: {
            id: true,
            status: true,
            installments: {
              where: { status: { not: "PAID" } },
              select: {
                expectedAmount: true,
                paidAmount: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calcular deuda activa total y cuotas pendientes
    return customers.map((c) => {
      let activeDebt = 0;
      let pendingInstallmentsCount = 0;
      let overdueInstallmentsCount = 0;

      c.loans.forEach((l) => {
        if (l.status === "ACTIVE" || l.status === "DEFAULTED") {
          l.installments.forEach((inst) => {
            if (inst.status !== "PAID") {
              activeDebt += inst.expectedAmount - inst.paidAmount;
              pendingInstallmentsCount++;
              if (inst.status === "OVERDUE") overdueInstallmentsCount++;
            }
          });
        }
      });

      c.shoeCredits.forEach((sc) => {
        if (sc.status === "ACTIVE" || sc.status === "DEFAULTED") {
          sc.installments.forEach((inst) => {
            if (inst.status !== "PAID") {
              activeDebt += inst.expectedAmount - inst.paidAmount;
              pendingInstallmentsCount++;
              if (inst.status === "OVERDUE") overdueInstallmentsCount++;
            }
          });
        }
      });

      return {
        ...c,
        activeDebt,
        pendingInstallmentsCount,
        overdueInstallmentsCount,
        activeLoansCount: c.loans.filter((l) => l.status === "ACTIVE").length,
        activeCreditsCount: c.shoeCredits.filter((sc) => sc.status === "ACTIVE").length,
      };
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw new Error("No se pudo obtener la lista de clientes");
  }
}

export async function getCustomerById(id: string) {
  try {
    return await prisma.customer.findUnique({
      where: { id },
      include: {
        loans: {
          include: {
            installments: {
              include: { payments: true },
              orderBy: { installmentNumber: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        shoeCredits: {
          include: {
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
        },
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 20,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error);
    throw new Error("No se pudo obtener el perfil del cliente");
  }
}

export async function createCustomer(data: CreateCustomerInput) {
  try {
    const docNum = data.documentNumber?.trim() || null;

    // Verificar si el documento ya existe (si fue provisto)
    if (docNum) {
      const existing = await prisma.customer.findFirst({
        where: { documentNumber: docNum },
      });
      if (existing) {
        return { success: false, error: "Ya existe un cliente con este número de documento" };
      }
    }

    const customer = await prisma.customer.create({
      data: {
        documentType: data.documentType || "DNI",
        documentNumber: docNum,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone.trim(),
        address: data.address?.trim() || null,
        creditScore: data.creditScore || "GOOD",
        status: "ACTIVE",
      },
    });

    revalidatePath("/clientes");
    revalidatePath("/");
    return { success: true, customer };
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    return { success: false, error: "Ocurrió un error al registrar el cliente" };
  }
}

export async function updateCustomer(id: string, data: Partial<CreateCustomerInput>) {
  try {
    const updated = await prisma.customer.update({
      where: { id },
      data,
    });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return { success: true, customer: updated };
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return { success: false, error: "No se pudo actualizar el cliente" };
  }
}
