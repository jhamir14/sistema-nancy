import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando sembrado de datos (Seed)...");

  // 1. Limpiar datos existentes
  await prisma.payment.deleteMany();
  await prisma.cashTransaction.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.shoeCreditItem.deleteMany();
  await prisma.shoeCredit.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.shoeVariant.deleteMany();
  await prisma.shoe.deleteMany();
  await prisma.customer.deleteMany();

  // 2. Crear Clientes
  const cliente1 = await prisma.customer.create({
    data: {
      documentType: "DNI",
      documentNumber: "72849102",
      firstName: "Carlos",
      lastName: "Mendoza Silva",
      phone: "987123456",
      phoneSecondary: "976543210",
      email: "carlos.mendoza@gmail.com",
      address: "Av. Próceres de la Independencia 1420",
      referenceAddress: "Frente al mercado La Unión, casa portón verde",
      neighborhood: "San Juan de Lurigancho",
      workplace: "Comerciante en Mercado Central",
      guarantorName: "Martha Silva (Madre)",
      guarantorPhone: "981223344",
      creditScore: "EXCELLENT",
      status: "ACTIVE",
      notes: "Cliente puntual. Cobra quincenas y fines de semana.",
    },
  });

  const cliente2 = await prisma.customer.create({
    data: {
      documentType: "DNI",
      documentNumber: "45902183",
      firstName: "Rosa María",
      lastName: "Gómez Flores",
      phone: "912345678",
      address: "Jr. Los Jazmines 340",
      referenceAddress: "A media cuadra de la farmacia",
      neighborhood: "Los Olivos",
      workplace: "Enfermera técnica en clínica",
      creditScore: "GOOD",
      status: "ACTIVE",
      notes: "Paga los días lunes puntualmente.",
    },
  });

  const cliente3 = await prisma.customer.create({
    data: {
      documentType: "DNI",
      documentNumber: "10293847",
      firstName: "Miguel Ángel",
      lastName: "Reyes Castro",
      phone: "998877665",
      address: "Av. Universitaria 2890",
      workplace: "Conductor independiente",
      creditScore: "REGULAR",
      status: "ACTIVE",
    },
  });

  console.log("✓ Clientes creados");

  // 3. Crear Zapatillas en Inventario
  const af1 = await prisma.shoe.create({
    data: {
      brand: "Nike",
      model: "Air Force 1 '07 Triple White",
      sku: "NK-AF1-001",
      category: "Urbana / Clásica",
      gender: "UNISEX",
      purchasePrice: 160.0, // Costo de compra (inversión)
      cashPrice: 240.0,     // Precio contado
      creditPrice: 300.0,   // Precio a crédito (cuotas)
      variants: {
        create: [
          { size: "38", colorway: "Triple White", stock: 2, minStockAlert: 1 },
          { size: "39", colorway: "Triple White", stock: 3, minStockAlert: 1 },
          { size: "40", colorway: "Triple White", stock: 4, minStockAlert: 1 },
          { size: "41", colorway: "Triple White", stock: 2, minStockAlert: 1 },
        ],
      },
    },
    include: { variants: true },
  });

  const jordan4 = await prisma.shoe.create({
    data: {
      brand: "Jordan",
      model: "Retro 4 Military Black",
      sku: "JD-RET4-BLK",
      category: "Hype / Exclusiva",
      gender: "MENS",
      purchasePrice: 280.0,
      cashPrice: 420.0,
      creditPrice: 520.0,
      variants: {
        create: [
          { size: "40", colorway: "Military Black", stock: 2, minStockAlert: 1 },
          { size: "41", colorway: "Military Black", stock: 2, minStockAlert: 1 },
          { size: "42", colorway: "Military Black", stock: 1, minStockAlert: 1 },
        ],
      },
    },
    include: { variants: true },
  });

  const forum = await prisma.shoe.create({
    data: {
      brand: "Adidas",
      model: "Forum Low White Blue",
      sku: "AD-FRM-002",
      category: "Casual",
      gender: "UNISEX",
      purchasePrice: 140.0,
      cashPrice: 210.0,
      creditPrice: 270.0,
      variants: {
        create: [
          { size: "39", colorway: "Blanco / Azul", stock: 3, minStockAlert: 1 },
          { size: "40", colorway: "Blanco / Azul", stock: 2, minStockAlert: 1 },
        ],
      },
    },
    include: { variants: true },
  });

  console.log("✓ Zapatillas en inventario creadas");

  // Registrar compras iniciales en caja
  await prisma.cashTransaction.createMany({
    data: [
      {
        type: "EXPENSE",
        category: "SHOE_INVENTORY_PURCHASE",
        amount: 1760.0,
        description: "Compra inicial de lote Nike Air Force 1 (11 pares)",
      },
      {
        type: "EXPENSE",
        category: "SHOE_INVENTORY_PURCHASE",
        amount: 1400.0,
        description: "Compra inicial de lote Jordan 4 Retro (5 pares)",
      },
      {
        type: "EXPENSE",
        category: "SHOE_INVENTORY_PURCHASE",
        amount: 700.0,
        description: "Compra inicial de lote Adidas Forum Low (5 pares)",
      },
    ],
  });

  // 4. Crear un Crédito de Zapatilla (SEMANAL)
  // Cliente 1 compra Nike Air Force 1 a 4 cuotas SEMANALES con enganche de S/ 60
  const af1Talla40 = af1.variants.find((v) => v.size === "40")!;
  const creditDate = new Date();
  creditDate.setDate(creditDate.getDate() - 10); // Empezó hace 10 días

  const credit1 = await prisma.shoeCredit.create({
    data: {
      creditCode: "CRZ-0001",
      customerId: cliente1.id,
      totalSaleAmount: 300.0,
      downPayment: 60.0,
      financedAmount: 240.0,
      frequency: "WEEKLY", // SEMANAL
      installmentsCount: 4,
      startDate: creditDate,
      status: "ACTIVE",
      notes: "Se le entregó en caja original con boleta de garantía",
      items: {
        create: [
          {
            shoeVariantId: af1Talla40.id,
            quantity: 1,
            unitCost: 160.0,
            unitCreditPrice: 300.0,
          },
        ],
      },
      installments: {
        create: [
          {
            installmentNumber: 1,
            dueDate: new Date(creditDate.getTime() + 7 * 24 * 60 * 60 * 1000), // Hace 3 días
            expectedAmount: 60.0,
            paidAmount: 60.0,
            status: "PAID",
            paidAt: new Date(creditDate.getTime() + 6 * 24 * 60 * 60 * 1000),
          },
          {
            installmentNumber: 2,
            dueDate: new Date(creditDate.getTime() + 14 * 24 * 60 * 60 * 1000), // Vence en 4 días
            expectedAmount: 60.0,
            paidAmount: 0.0,
            status: "PENDING",
          },
          {
            installmentNumber: 3,
            dueDate: new Date(creditDate.getTime() + 21 * 24 * 60 * 60 * 1000),
            expectedAmount: 60.0,
            paidAmount: 0.0,
            status: "PENDING",
          },
          {
            installmentNumber: 4,
            dueDate: new Date(creditDate.getTime() + 28 * 24 * 60 * 60 * 1000),
            expectedAmount: 60.0,
            paidAmount: 0.0,
            status: "PENDING",
          },
        ],
      },
    },
    include: { installments: true },
  });

  // Descontar el par entregado
  await prisma.shoeVariant.update({
    where: { id: af1Talla40.id },
    data: { stock: { decrement: 1 } },
  });

  // Registrar el enganche en caja
  await prisma.cashTransaction.create({
    data: {
      type: "INCOME",
      category: "DOWN_PAYMENT",
      amount: 60.0,
      description: "Enganche de crédito CRZ-0001 (Carlos Mendoza)",
      referenceId: credit1.id,
    },
  });

  // Registrar el pago de la cuota 1
  const cuota1 = credit1.installments.find((i) => i.installmentNumber === 1)!;
  await prisma.payment.create({
    data: {
      receiptNumber: "REC-2026-00001",
      installmentId: cuota1.id,
      customerId: cliente1.id,
      amount: 60.0,
      paymentMethod: "CASH",
      collectedBy: "Nancy Flores",
      notes: "Pago cuota 1 puntual",
    },
  });
  await prisma.cashTransaction.create({
    data: {
      type: "INCOME",
      category: "PAYMENT_COLLECTION",
      amount: 60.0,
      description: "Cobro cuota #1 (REC-2026-00001) - Carlos Mendoza",
      referenceId: cuota1.id,
    },
  });

  // 5. Crear un Préstamo en Efectivo (MENSUAL)
  // Cliente 2 solicita S/ 1,000 al 15% a 2 cuotas MENSUALES
  const loanDate = new Date();
  loanDate.setDate(loanDate.getDate() - 5);

  const loan1 = await prisma.loan.create({
    data: {
      loanCode: "PRE-0001",
      customerId: cliente2.id,
      principalAmount: 1000.0,
      interestRate: 15.0,
      totalInterest: 150.0,
      totalAmount: 1150.0,
      frequency: "MONTHLY", // MENSUAL
      installmentsCount: 2,
      disbursementDate: loanDate,
      firstDueDate: new Date(loanDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      collateral: "Prenda dejada: Collar de oro 18k en custodia",
      status: "ACTIVE",
      notes: "Desembolsado en efectivo en caja",
      installments: {
        create: [
          {
            installmentNumber: 1,
            dueDate: new Date(loanDate.getTime() + 30 * 24 * 60 * 60 * 1000),
            expectedAmount: 575.0,
            paidAmount: 0.0,
            status: "PENDING",
          },
          {
            installmentNumber: 2,
            dueDate: new Date(loanDate.getTime() + 60 * 24 * 60 * 60 * 1000),
            expectedAmount: 575.0,
            paidAmount: 0.0,
            status: "PENDING",
          },
        ],
      },
    },
  });

  // Registrar desembolso en caja
  await prisma.cashTransaction.create({
    data: {
      type: "EXPENSE",
      category: "LOAN_DISBURSEMENT",
      amount: 1000.0,
      description: "Desembolso de préstamo PRE-0001 a Rosa María Gómez Flores",
      referenceId: loan1.id,
    },
  });

  console.log("✓ Crédito semanal y Préstamo mensual creados exitosamente");
  console.log("¡Sembrado completado con éxito!");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
