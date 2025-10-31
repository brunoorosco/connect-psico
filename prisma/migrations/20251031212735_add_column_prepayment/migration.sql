/*
  Warnings:

  - You are about to alter the column `pixKey` on the `bank_account` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.
  - You are about to drop the column `(titulo_academico)` on the `professionals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bank_account" ADD COLUMN     "prepaymentEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "pixKey" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "(titulo_academico)",
ADD COLUMN     "titulo_academico" TEXT;
