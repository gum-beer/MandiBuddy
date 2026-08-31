-- CreateTable
CREATE TABLE "ArrivalEntry" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "arrivalType" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArrivalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrivalItem" (
    "id" SERIAL NOT NULL,
    "arrivalEntryId" INTEGER NOT NULL,
    "itemName" TEXT NOT NULL,
    "lotNo" TEXT NOT NULL,
    "nug" INTEGER NOT NULL,
    "isCrateForm" BOOLEAN NOT NULL DEFAULT false,
    "crateType" TEXT,
    "weight" DOUBLE PRECISION,

    CONSTRAINT "ArrivalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrivalCharge" (
    "id" SERIAL NOT NULL,
    "arrivalEntryId" INTEGER NOT NULL,
    "chargeType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ArrivalCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockSale" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "arrivalItemId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL DEFAULT 'Cash',
    "nug" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "unitType" TEXT NOT NULL,
    "customerRate" DOUBLE PRECISION NOT NULL,
    "supplierRate" DOUBLE PRECISION NOT NULL,
    "basicAmount" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockSale_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArrivalEntry" ADD CONSTRAINT "ArrivalEntry_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalItem" ADD CONSTRAINT "ArrivalItem_arrivalEntryId_fkey" FOREIGN KEY ("arrivalEntryId") REFERENCES "ArrivalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrivalCharge" ADD CONSTRAINT "ArrivalCharge_arrivalEntryId_fkey" FOREIGN KEY ("arrivalEntryId") REFERENCES "ArrivalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockSale" ADD CONSTRAINT "StockSale_arrivalItemId_fkey" FOREIGN KEY ("arrivalItemId") REFERENCES "ArrivalItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
