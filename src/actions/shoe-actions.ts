"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface VariantInput {
  size: string;
  colorway: string;
  stock: number;
  minStockAlert?: number;
}

export interface CreateShoeInput {
  brand: string;
  model: string;
  sku?: string;
  gender?: string;
  category?: string;
  description?: string;
  imageUrl?: string;
  purchasePrice?: number;
  cashPrice: number;     // Precio al contado (precio normal)
  creditPrice?: number;
  variants: VariantInput[];
}

export async function getShoes(search?: string) {
  try {
    const whereClause = search
      ? {
          OR: [
            { brand: { contains: search } },
            { model: { contains: search } },
            { sku: { contains: search } },
          ],
        }
      : {};

    const shoes = await prisma.shoe.findMany({
      where: whereClause,
      include: {
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return shoes.map((shoe) => {
      const totalStock = shoe.variants.reduce((acc, v) => acc + v.stock, 0);
      const totalInvestedInStock = totalStock * shoe.purchasePrice;
      const potentialProfitCredit = totalStock * (shoe.creditPrice - shoe.purchasePrice);
      const lowStockVariants = shoe.variants.filter((v) => v.stock <= v.minStockAlert);

      return {
        ...shoe,
        totalStock,
        totalInvestedInStock,
        potentialProfitCredit,
        hasLowStock: lowStockVariants.length > 0,
      };
    });
  } catch (error) {
    console.error("Error al obtener catálogo de zapatillas:", error);
    throw new Error("No se pudo obtener el catálogo de calzado");
  }
}

export async function getShoeVariantsAvailable() {
  try {
    return await prisma.shoeVariant.findMany({
      where: {
        stock: { gt: 0 },
        shoe: { isActive: true },
      },
      include: {
        shoe: true,
      },
      orderBy: [{ shoe: { brand: "asc" } }, { shoe: { model: "asc" } }, { size: "asc" }],
    });
  } catch (error) {
    console.error("Error al obtener variantes disponibles:", error);
    throw new Error("No se pudieron obtener las variantes en stock");
  }
}

export async function createShoe(data: CreateShoeInput) {
  try {
    if (!data.cashPrice || Number(data.cashPrice) <= 0) {
      return { success: false, error: "El precio al contado debe ser mayor a 0" };
    }

    if (!data.variants || data.variants.length === 0) {
      return { success: false, error: "Debes agregar al menos una talla con su stock" };
    }

    const cashPriceNum = Number(data.cashPrice);
    const purchasePriceNum = data.purchasePrice !== undefined ? Number(data.purchasePrice) : 0;
    const creditPriceNum = data.creditPrice !== undefined ? Number(data.creditPrice) : cashPriceNum;

    const newShoe = await prisma.$transaction(async (tx) => {
      const shoe = await tx.shoe.create({
        data: {
          brand: data.brand.trim(),
          model: data.model.trim(),
          sku: data.sku?.trim() || null,
          gender: data.gender || "UNISEX",
          category: data.category?.trim() || "Casual",
          description: data.description?.trim() || null,
          imageUrl: data.imageUrl?.trim() || null,
          purchasePrice: purchasePriceNum,
          cashPrice: cashPriceNum,
          creditPrice: creditPriceNum,
          variants: {
            create: data.variants.map((v) => ({
              size: v.size.trim(),
              colorway: v.colorway.trim() || "Estándar",
              stock: Number(v.stock),
              minStockAlert: Number(v.minStockAlert || 1),
            })),
          },
        },
        include: { variants: true },
      });

      // Registrar movimiento de egreso si se especificó costo de compra mayor a 0
      const initialPairs = data.variants.reduce((acc, v) => acc + Number(v.stock), 0);
      if (initialPairs > 0 && purchasePriceNum > 0) {
        const totalCost = initialPairs * purchasePriceNum;
        await tx.cashTransaction.create({
          data: {
            type: "EXPENSE",
            category: "SHOE_INVENTORY_PURCHASE",
            amount: totalCost,
            description: `Compra inicial de inventario: ${initialPairs} pares de ${shoe.brand} ${shoe.model}`,
            referenceId: shoe.id,
          },
        });
      }

      return shoe;
    });

    revalidatePath("/zapatillas");
    revalidatePath("/creditos");
    revalidatePath("/");
    return { success: true, shoe: newShoe };
  } catch (error) {
    console.error("Error al crear zapatilla:", error);
    return { success: false, error: "Ocurrió un error al registrar el calzado" };
  }
}

export async function updateVariantStock(variantId: string, newStock: number) {
  try {
    const variant = await prisma.shoeVariant.update({
      where: { id: variantId },
      data: { stock: Math.max(0, newStock) },
      include: { shoe: true },
    });

    revalidatePath("/zapatillas");
    revalidatePath("/creditos");
    revalidatePath("/");
    return { success: true, variant };
  } catch (error) {
    console.error("Error al actualizar stock:", error);
    return { success: false, error: "No se pudo actualizar el stock" };
  }
}

export async function adjustStock(variantId: string, delta: number) {
  try {
    const current = await prisma.shoeVariant.findUnique({
      where: { id: variantId },
      include: { shoe: true },
    });

    if (!current) {
      return { success: false, error: "Talla/Variante no encontrada" };
    }

    const newStock = Math.max(0, current.stock + delta);

    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.shoeVariant.update({
        where: { id: variantId },
        data: { stock: newStock },
        include: { shoe: true },
      });

      // Si se añade stock nuevo, registrar egreso por compra de inventario
      if (delta > 0) {
        await tx.cashTransaction.create({
          data: {
            type: "EXPENSE",
            category: "SHOE_INVENTORY_PURCHASE",
            amount: delta * current.shoe.purchasePrice,
            description: `Reabastecimiento de stock: +${delta} pares de ${current.shoe.brand} ${current.shoe.model} (Talla ${current.size})`,
            referenceId: current.shoe.id,
          },
        });
      }

      return v;
    });

    revalidatePath("/zapatillas");
    revalidatePath("/creditos");
    revalidatePath("/");
    return { success: true, variant: updated };
  } catch (error) {
    console.error("Error al ajustar stock:", error);
    return { success: false, error: "No se pudo ajustar el stock" };
  }
}

export async function addVariantToShoe(shoeId: string, variant: VariantInput) {
  try {
    const newVariant = await prisma.$transaction(async (tx) => {
      const v = await tx.shoeVariant.create({
        data: {
          shoeId,
          size: variant.size.trim(),
          colorway: variant.colorway.trim() || "Estándar",
          stock: Number(variant.stock),
          minStockAlert: Number(variant.minStockAlert || 1),
        },
        include: { shoe: true },
      });

      if (variant.stock > 0) {
        await tx.cashTransaction.create({
          data: {
            type: "EXPENSE",
            category: "SHOE_INVENTORY_PURCHASE",
            amount: Number(variant.stock) * v.shoe.purchasePrice,
            description: `Nueva talla agregada: ${variant.stock} pares de ${v.shoe.brand} ${v.shoe.model} (Talla ${variant.size})`,
            referenceId: shoeId,
          },
        });
      }

      return v;
    });

    revalidatePath("/zapatillas");
    revalidatePath("/creditos");
    revalidatePath("/");
    return { success: true, variant: newVariant };
  } catch (error) {
    console.error("Error al agregar variante:", error);
    return { success: false, error: "No se pudo agregar la talla" };
  }
}

export async function updateShoe(id: string, data: Partial<CreateShoeInput>) {
  try {
    const updated = await prisma.shoe.update({
      where: { id },
      data: {
        brand: data.brand?.trim(),
        model: data.model?.trim(),
        sku: data.sku?.trim() || null,
        category: data.category?.trim(),
        gender: data.gender,
        imageUrl: data.imageUrl !== undefined ? (data.imageUrl ? data.imageUrl.trim() : null) : undefined,
        purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : undefined,
        cashPrice: data.cashPrice ? Number(data.cashPrice) : undefined,
        creditPrice: data.creditPrice ? Number(data.creditPrice) : undefined,
      },
    });

    revalidatePath("/zapatillas");
    revalidatePath("/creditos");
    revalidatePath("/");
    return { success: true, shoe: updated };
  } catch (error) {
    console.error("Error al actualizar zapatilla:", error);
    return { success: false, error: "No se pudo actualizar el calzado" };
  }
}
