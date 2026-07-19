-- CreateTable
CREATE TABLE "tax_mapper_record" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "no" INTEGER,
    "niop" TEXT NOT NULL,
    "namaObjekPajak" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_mapper_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tax_mapper_record_niop_idx" ON "tax_mapper_record"("niop");

-- CreateIndex
CREATE INDEX "tax_mapper_record_type_idx" ON "tax_mapper_record"("type");

-- CreateIndex
CREATE INDEX "tax_mapper_record_month_idx" ON "tax_mapper_record"("month");
