-- CreateTable
CREATE TABLE "sptpd_ketetapan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "no" INTEGER,
    "jenisPajak" TEXT NOT NULL,
    "npwpd" TEXT NOT NULL,
    "namaRekening" TEXT NOT NULL,
    "nop" TEXT,
    "namaWp" TEXT NOT NULL,
    "namaObjek" TEXT,
    "alamatObjek" TEXT,
    "kecamatan" TEXT,
    "desa" TEXT,
    "kohir" TEXT NOT NULL,
    "tglLapor" TIMESTAMP(3),
    "masaPajak" TEXT,
    "masaPajakYear" INTEGER,
    "masaPajakMonth" INTEGER,
    "jumlah" DECIMAL(18,2) NOT NULL,
    "keterangan" TEXT,
    "petugasInput" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sptpd_ketetapan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sptpd_penerimaan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "no" INTEGER,
    "jenisPajak" TEXT NOT NULL,
    "noRekening" TEXT,
    "namaRekening" TEXT,
    "namaSipd" TEXT,
    "noBukti" TEXT,
    "diterimaDari" TEXT,
    "alamat" TEXT,
    "desa" TEXT,
    "kecamatan" TEXT,
    "pembayaranDari" TEXT,
    "npwpd" TEXT,
    "kohir" TEXT,
    "nop" TEXT,
    "ket" TEXT,
    "masaPajak" TEXT,
    "pokok" DECIMAL(18,2),
    "sanksi" DECIMAL(18,2),
    "lain2" DECIMAL(18,2),
    "totalBayar" DECIMAL(18,2) NOT NULL,
    "tglBayar" TIMESTAMP(3),
    "tglKetetapan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sptpd_penerimaan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sptpd_ketetapan_kohir_key" ON "sptpd_ketetapan"("kohir");

-- CreateIndex
CREATE INDEX "sptpd_ketetapan_npwpd_idx" ON "sptpd_ketetapan"("npwpd");

-- CreateIndex
CREATE INDEX "sptpd_ketetapan_jenisPajak_idx" ON "sptpd_ketetapan"("jenisPajak");

-- CreateIndex
CREATE INDEX "sptpd_ketetapan_masaPajakYear_masaPajakMonth_idx" ON "sptpd_ketetapan"("masaPajakYear", "masaPajakMonth");

-- CreateIndex
CREATE INDEX "sptpd_penerimaan_npwpd_idx" ON "sptpd_penerimaan"("npwpd");

-- CreateIndex
CREATE INDEX "sptpd_penerimaan_kohir_idx" ON "sptpd_penerimaan"("kohir");

-- CreateIndex
CREATE INDEX "sptpd_penerimaan_jenisPajak_idx" ON "sptpd_penerimaan"("jenisPajak");
