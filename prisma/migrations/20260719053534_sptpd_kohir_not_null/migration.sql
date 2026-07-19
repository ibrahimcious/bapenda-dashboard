/*
  Warnings:

  - Made the column `kohir` on table `sptpd_ketetapan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "sptpd_ketetapan" ALTER COLUMN "kohir" SET NOT NULL;
