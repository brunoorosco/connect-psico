/*
  Warnings:

  - Changed the type of `valor_atendimento` on the `professionals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "professionals" DROP COLUMN "valor_atendimento",
ADD COLUMN     "valor_atendimento" INTEGER NOT NULL DEFAULT 0;
